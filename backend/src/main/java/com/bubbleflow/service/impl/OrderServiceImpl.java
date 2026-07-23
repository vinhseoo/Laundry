package com.bubbleflow.service.impl;

import com.bubbleflow.dto.order.request.OrderItemRequest;
import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.request.OrderDeliveryRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Order;
import com.bubbleflow.entity.OrderItem;
import com.bubbleflow.entity.Service;
import com.bubbleflow.entity.StorageRack;
import com.bubbleflow.entity.OrderStateLog;
import com.bubbleflow.entity.state.OrderEvent;
import com.bubbleflow.entity.state.OrderState;
import com.bubbleflow.exception.BusinessException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.OrderMapper;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.repository.ServiceRepository;
import com.bubbleflow.repository.OrderStateLogRepository;
import com.bubbleflow.repository.StorageRackRepository;
import com.bubbleflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
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
    private final StorageRackRepository storageRackRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final SystemSettingsServiceImpl systemSettingsService;
    private final StateMachineFactory<OrderState, OrderEvent> stateMachineFactory;
    private final com.bubbleflow.repository.CustomerRepository customerRepository;
    private final com.bubbleflow.repository.LaundryBasketRepository laundryBasketRepository;
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

        // Find or create customer by phone number
        com.bubbleflow.entity.Customer customer = customerRepository.findByPhone(request.getCustomerPhone())
                .orElseGet(() -> {
                    com.bubbleflow.entity.Customer newCustomer = com.bubbleflow.entity.Customer.builder()
                            .name(request.getCustomerName())
                            .phone(request.getCustomerPhone())
                            .isActive(true)
                            .build();
                    return customerRepository.save(newCustomer);
                });
        order.setCustomer(customer);

        BigDecimal total = calculateAndAddItems(order, request.getItems());
        
        // Apply VAT rate configuration
        String vatRateStr = systemSettingsService.getStringSetting("vat_rate", "8");
        double vatRate = 0.0;
        try {
            vatRate = Double.parseDouble(vatRateStr);
        } catch (NumberFormatException e) {
            log.warn("Invalid vat_rate configuration setting: {}", vatRateStr);
        }
        if (vatRate > 0) {
            BigDecimal vatMultiplier = BigDecimal.valueOf(1 + vatRate / 100);
            total = total.multiply(vatMultiplier);
        }
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
        incrementRedisStats(order);
        return toEnrichedResponse(order);
    }

    private void incrementRedisStats(Order order) {
        try {
            String todayStr = java.time.LocalDate.now().toString();
            String orderCountKey = "dashboard:stats:order_count:" + todayStr;
            String revenueKey = "dashboard:stats:revenue:" + todayStr;

            stringRedisTemplate.opsForValue().increment(orderCountKey);
            stringRedisTemplate.opsForValue().increment(revenueKey, order.getTotalAmount().doubleValue());

            stringRedisTemplate.expire(orderCountKey, java.time.Duration.ofDays(1));
            stringRedisTemplate.expire(revenueKey, java.time.Duration.ofDays(1));
        } catch (Exception e) {
            log.warn("Failed to increment real-time Redis stats: {}", e.getMessage());
        }
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
    @Transactional
    public OrderResponse assignRack(Long id, Long rackId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (!"AWAITING_DELIVERY".equals(order.getStatus())) {
            throw new BusinessException("Chỉ được gán kệ cho đơn hàng đang chờ nhận (AWAITING_DELIVERY).");
        }
        if (order.getStorageRack() != null) {
            StorageRack oldRack = order.getStorageRack();
            oldRack.setStatus("AVAILABLE");
            storageRackRepository.save(oldRack);
        }
        StorageRack rack = storageRackRepository.findById(rackId)
                .orElseThrow(() -> new ResourceNotFoundException("StorageRack", "id", rackId));
        if (!"AVAILABLE".equals(rack.getStatus())) {
            throw new BusinessException("Kệ " + rack.getName() + " không ở trạng thái sẵn sàng.");
        }
        rack.setStatus("OCCUPIED");
        storageRackRepository.save(rack);
        order.setStorageRack(rack);
        order = orderRepository.save(order);
        log.info("Assigned storage rack {} to order {}", rack.getName(), order.getOrderCode());
        return toEnrichedResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse deliverOrder(Long id, OrderDeliveryRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        String oldStatus = order.getStatus();
        if (!"AWAITING_DELIVERY".equals(oldStatus)) {
            throw new BusinessException("Chỉ giao nhận trả hàng cho đơn hàng ở trạng thái chờ nhận.");
        }
        validateTransition(oldStatus, "COMPLETED", order.getOrderCode());
        releaseRackIfAssigned(order);

        // Auto release any laundry baskets assigned to this order
        List<com.bubbleflow.entity.LaundryBasket> assignedBaskets = laundryBasketRepository.findByOrderId(order.getId());
        for (com.bubbleflow.entity.LaundryBasket b : assignedBaskets) {
            b.setOrder(null);
            b.setEquipment(null);
            b.setStatus("IDLE");
            laundryBasketRepository.save(b);
        }
        
        order.setStatus("COMPLETED");
        order.setPaymentStatus("PAID");
        order.setPaymentMethod(request.getPaymentMethod());
        order.setDeliveryType(request.getDeliveryType());
        if ("SHIPPER".equals(request.getDeliveryType())) {
            order.setShipperName(request.getShipperName());
            order.setShipperPhone(request.getShipperPhone());
        }
        order.setDeliveredAt(LocalDateTime.now());
        order.setDeliveredBy(getCurrentAuditor());
        order = orderRepository.save(order);

        saveStateLog(order, oldStatus, "COMPLETED");
        log.info("Delivered order: {}", order.getOrderCode());
        return toEnrichedResponse(order);
    }

    private void releaseRackIfAssigned(Order order) {
        if (order.getStorageRack() != null) {
            StorageRack rack = order.getStorageRack();
            rack.setStatus("AVAILABLE");
            storageRackRepository.save(rack);
            order.setStorageRack(null);
        }
    }

    private String getCurrentAuditor() {
        org.springframework.security.core.context.SecurityContext context = 
            org.springframework.security.core.context.SecurityContextHolder.getContext();
        if (context != null && context.getAuthentication() != null) {
            return context.getAuthentication().getName();
        }
        return "system";
    }

    private void saveStateLog(Order order, String fromState, String toState) {
        OrderStateLog stateLog = OrderStateLog.builder()
                .order(order)
                .fromState(fromState)
                .toState(toState)
                .changedBy(order.getUpdatedBy() != null ? order.getUpdatedBy() : getCurrentAuditor())
                .changedAt(LocalDateTime.now())
                .build();
        orderStateLogRepository.save(stateLog);
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
                return systemSettingsService.getIntegerSetting("sla_received_sorting", 120);
            case WASHING:
            case DRYING:
                return systemSettingsService.getIntegerSetting("sla_washing_drying", 60);
            case AWAITING_DELIVERY:
                return systemSettingsService.getIntegerSetting("sla_awaiting_delivery", 1440);
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
