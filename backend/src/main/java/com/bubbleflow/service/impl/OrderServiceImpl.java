package com.bubbleflow.service.impl;

import com.bubbleflow.dto.order.request.OrderItemRequest;
import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Order;
import com.bubbleflow.entity.OrderItem;
import com.bubbleflow.entity.Service;
import com.bubbleflow.exception.BusinessException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.OrderMapper;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.repository.ServiceRepository;
import com.bubbleflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAll(String search, String status, Pageable pageable) {
        Page<Order> page = orderRepository.findWithFilters(search, status, pageable);
        List<OrderResponse> content = orderMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return orderMapper.toResponse(order);
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
        log.info("Created order: {}", order.getOrderCode());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setStatus(status.toUpperCase());
        order = orderRepository.save(order);
        log.info("Updated order status: {} -> {}", order.getOrderCode(), status);
        return orderMapper.toResponse(order);
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
