package com.bubbleflow.service.impl;

import com.bubbleflow.dto.order.request.OrderItemRequest;
import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Order;
import com.bubbleflow.entity.OrderItem;
import com.bubbleflow.entity.Service;
import com.bubbleflow.entity.OrderStateLog;
import com.bubbleflow.entity.state.OrderEvent;
import com.bubbleflow.entity.state.OrderState;
import com.bubbleflow.exception.BusinessException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.OrderMapper;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.repository.ServiceRepository;
import com.bubbleflow.repository.OrderStateLogRepository;
import com.bubbleflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final OrderStateLogRepository orderStateLogRepository;
    private final StateMachineFactory<OrderState, OrderEvent> stateMachineFactory;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAll(String search, String status, Pageable pageable) {
        Page<Order> page = orderRepository.findWithFilters(search, status, pageable);
        List<OrderResponse> content = page.getContent().stream()
                .map(this::toEnrichedResponse)
                .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return toEnrichedResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse create(OrderRequest request) {
        Order order = orderMapper.toEntity(request);
        order.setOrderCode(generateOrderCode());
        order.setStatus("RECEIVED");

        BigDecimal total = calculateAndAddItems(order, request.getItems());
        order.setTotalAmount(total);

        order = orderRepository.save(order);

        // Record initial state log
        OrderStateLog stateLog = OrderStateLog.builder()
                .order(order)
                .fromState(null)
                .toState("RECEIVED")
                .changedBy(order.getCreatedBy() != null ? order.getCreatedBy() : "system")
                .changedAt(LocalDateTime.now())
                .build();
        orderStateLogRepository.save(stateLog);

        log.info("Created order: {}", order.getOrderCode());
        return toEnrichedResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        String oldStatus = order.getStatus();
        String newStatus = status.toUpperCase();

        if (oldStatus.equals(newStatus)) {
            return toEnrichedResponse(order);
        }

        // Validate via Spring Statemachine
        validateTransition(oldStatus, newStatus, order.getOrderCode());

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        // Record state log
        OrderStateLog stateLog = OrderStateLog.builder()
                .order(order)
                .fromState(oldStatus)
                .toState(newStatus)
                .changedBy(order.getUpdatedBy() != null ? order.getUpdatedBy() : "system")
                .changedAt(LocalDateTime.now())
                .build();
        orderStateLogRepository.save(stateLog);

        log.info("Updated order status: {} -> {}", order.getOrderCode(), newStatus);
        return toEnrichedResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getSlaWarnings() {
        return orderRepository.findAll().stream()
                .filter(Order::getIsActive)
                .map(this::toEnrichedResponse)
                .filter(OrderResponse::getSlaViolated)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setIsActive(false);
        orderRepository.save(order);
        log.info("Deleted (soft) order: {}", order.getOrderCode());
    }

    private OrderResponse toEnrichedResponse(Order order) {
        OrderResponse response = orderMapper.toResponse(order);
        enrichSla(order, response);
        return response;
    }

    private void enrichSla(Order order, OrderResponse response) {
        Optional<OrderStateLog> latestLogOpt = orderStateLogRepository.findFirstByOrderIdOrderByChangedAtDesc(order.getId());
        LocalDateTime startTime = latestLogOpt.map(OrderStateLog::getChangedAt).orElse(order.getCreatedAt());

        Duration duration = Duration.between(startTime, LocalDateTime.now());
        long minutesElapsed = duration.toMinutes();

        String durationStr = minutesElapsed < 60 
                ? minutesElapsed + " phút" 
                : (minutesElapsed / 60) + " giờ " + (minutesElapsed % 60) + " phút";

        OrderState state;
        try {
            state = OrderState.valueOf(response.getStatus());
        } catch (IllegalArgumentException e) {
            state = OrderState.RECEIVED;
        }

        long limitMinutes = getSlaLimitForState(state);
        long remaining = limitMinutes - minutesElapsed;

        response.setSlaRemainingMinutes(limitMinutes == Long.MAX_VALUE ? null : remaining);
        response.setSlaViolated(limitMinutes != Long.MAX_VALUE && remaining < 0 && state != OrderState.COMPLETED);
        response.setCurrentDuration(durationStr);
    }

    private long getSlaLimitForState(OrderState state) {
        switch (state) {
            case RECEIVED:
            case SORTING:
                return 120; // 2 hours
            case WASHING:
            case DRYING:
                return 60; // 1 hour
            case AWAITING_DELIVERY:
                return 1440; // 24 hours
            case COMPLETED:
            default:
                return Long.MAX_VALUE;
        }
    }

    private void validateTransition(String oldStatus, String newStatus, String orderCode) {
        OrderState sourceState = OrderState.valueOf(oldStatus);
        OrderState targetState = OrderState.valueOf(newStatus);
        OrderEvent event = getEventForTargetState(targetState);

        StateMachine<OrderState, OrderEvent> stateMachine = stateMachineFactory.getStateMachine(orderCode);
        stateMachine.stopReactively().block();
        stateMachine.getStateMachineAccessor().doWithAllRegions(accessor -> 
            accessor.resetStateMachineReactively(
                new DefaultStateMachineContext<>(sourceState, null, null, null)
            ).block()
        );
        stateMachine.startReactively().block();

        boolean accepted = stateMachine.sendEvent(Mono.just(MessageBuilder.withPayload(event).build()))
                .blockLast()
                .getResultType() == org.springframework.statemachine.StateMachineEventResult.ResultType.ACCEPTED;

        if (!accepted) {
            throw new BusinessException("Chuyển đổi trạng thái từ " + oldStatus + " sang " + newStatus + " qua sự kiện " + event + " không hợp lệ theo vòng đời đơn hàng.");
        }
    }

    private OrderEvent getEventForTargetState(OrderState targetState) {
        switch (targetState) {
            case SORTING: return OrderEvent.SORT;
            case WASHING: return OrderEvent.WASH;
            case DRYING: return OrderEvent.DRY;
            case AWAITING_DELIVERY: return OrderEvent.AWAIT_DELIVERY;
            case COMPLETED: return OrderEvent.COMPLETE;
            default: throw new BusinessException("Không có sự kiện chuyển tiếp tương ứng cho trạng thái: " + targetState);
        }
    }

    private BigDecimal calculateAndAddItems(Order order, List<OrderItemRequest> itemRequests) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest req : itemRequests) {
            Service service = serviceRepository.findById(req.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service", "id", req.getServiceId()));
            if (!service.getIsActive()) {
                throw new BusinessException("Dịch vụ " + service.getName() + " đã bị vô hiệu hóa.");
            }
            BigDecimal subtotal = service.getPrice().multiply(req.getQuantity());
            OrderItem item = OrderItem.builder()
                    .service(service)
                    .quantity(req.getQuantity())
                    .unitPrice(service.getPrice())
                    .subtotal(subtotal)
                    .notes(req.getNotes())
                    .build();
            order.addItem(item);
            total = total.add(subtotal);
        }
        return total;
    }

    private String generateOrderCode() {
        return "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
