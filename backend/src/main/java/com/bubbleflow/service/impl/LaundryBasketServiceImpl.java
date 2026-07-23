package com.bubbleflow.service.impl;

import com.bubbleflow.dto.basket.request.LaundryBasketRequest;
import com.bubbleflow.dto.basket.response.LaundryBasketResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Equipment;
import com.bubbleflow.entity.EquipmentUsageLog;
import com.bubbleflow.entity.LaundryBasket;
import com.bubbleflow.entity.Order;
import com.bubbleflow.exception.BusinessException;
import com.bubbleflow.exception.DuplicateResourceException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.LaundryBasketMapper;
import com.bubbleflow.repository.EquipmentRepository;
import com.bubbleflow.repository.EquipmentUsageLogRepository;
import com.bubbleflow.repository.LaundryBasketRepository;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.service.LaundryBasketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class LaundryBasketServiceImpl implements LaundryBasketService {

    private final LaundryBasketRepository basketRepository;
    private final OrderRepository orderRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageLogRepository equipmentUsageLogRepository;
    private final com.bubbleflow.repository.OrderStateLogRepository orderStateLogRepository;
    private final com.bubbleflow.service.NotificationService notificationService;
    private final LaundryBasketMapper basketMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LaundryBasketResponse> getAll(String search, String status, Pageable pageable) {
        Page<LaundryBasket> page = basketRepository.findWithFilters(search, status, pageable);
        List<LaundryBasketResponse> content = basketMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LaundryBasketResponse> getActiveBaskets() {
        List<LaundryBasket> list = basketRepository.findByIsActiveTrue();
        return basketMapper.toResponseList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public LaundryBasketResponse getById(Long id) {
        LaundryBasket basket = basketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LaundryBasket", "id", id));
        return basketMapper.toResponse(basket);
    }

    @Override
    @Transactional
    public LaundryBasketResponse create(LaundryBasketRequest request) {
        if (basketRepository.existsByBasketCode(request.getBasketCode())) {
            throw new DuplicateResourceException("LaundryBasket", "basketCode", request.getBasketCode());
        }
        LaundryBasket basket = basketMapper.toEntity(request);
        basket.setStatus("IDLE");
        basket = basketRepository.save(basket);
        log.info("Created laundry basket: {}", basket.getBasketCode());
        return basketMapper.toResponse(basket);
    }

    @Override
    @Transactional
    public LaundryBasketResponse update(Long id, LaundryBasketRequest request) {
        LaundryBasket basket = basketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LaundryBasket", "id", id));

        if (basketRepository.existsByBasketCodeAndIdNot(request.getBasketCode(), id)) {
            throw new DuplicateResourceException("LaundryBasket", "basketCode", request.getBasketCode());
        }

        basketMapper.updateEntity(request, basket);
        basket = basketRepository.save(basket);
        log.info("Updated laundry basket: {}", basket.getBasketCode());
        return basketMapper.toResponse(basket);
    }

    @Override
    @Transactional
    public LaundryBasketResponse assignToOrder(Long basketId, Long orderId) {
        LaundryBasket basket = basketRepository.findById(basketId)
                .orElseThrow(() -> new ResourceNotFoundException("LaundryBasket", "id", basketId));

        if (orderId == null) {
            basket.setOrder(null);
            basket.setStatus("IDLE");
        } else {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
            basket.setOrder(order);
            basket.setStatus("USING");
        }

        basket = basketRepository.save(basket);
        log.info("Assigned basket {} to order ID: {}", basket.getBasketCode(), orderId);
        return basketMapper.toResponse(basket);
    }

    private double getOrderWeight(Order order) {
        if (order == null || order.getItems() == null) {
            return 0.0;
        }
        return order.getItems().stream()
                .filter(item -> item.getService() != null && "KG".equalsIgnoreCase(item.getService().getPriceUnit()))
                .mapToDouble(item -> item.getQuantity().doubleValue())
                .sum();
    }

    @Override
    @Transactional
    public LaundryBasketResponse assignToEquipment(Long basketId, Long equipmentId) {
        LaundryBasket basket = basketRepository.findById(basketId)
                .orElseThrow(() -> new ResourceNotFoundException("LaundryBasket", "id", basketId));

        if (basket.getOrder() == null) {
            throw new BusinessException("Giỏ đồ chưa được gán vào đơn hàng nào, không thể điều phối máy.");
        }

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        if (!equipment.getIsActive()) {
            throw new BusinessException("Thiết bị " + equipment.getName() + " không hoạt động.");
        }

        if ("MAINTENANCE".equals(equipment.getStatus()) || "OUT_OF_SERVICE".equals(equipment.getStatus())) {
            throw new BusinessException("Thiết bị " + equipment.getName() + " đang bảo trì hoặc hỏng.");
        }

        // Limit checking capacity if it is RUNNING or IDLE
        List<LaundryBasket> basketsInEquipment = basketRepository.findByEquipmentId(equipmentId);
        double currentWeight = basketsInEquipment.stream()
                .mapToDouble(b -> getOrderWeight(b.getOrder()))
                .sum();
        double newBasketWeight = getOrderWeight(basket.getOrder());

        if (currentWeight + newBasketWeight > equipment.getCapacity()) {
            throw new BusinessException(String.format(
                    "Không thể gom thêm giỏ đồ này. Tổng khối lượng (%s kg) vượt quá công suất máy (%s kg).",
                    currentWeight + newBasketWeight, equipment.getCapacity()
            ));
        }

        // Validate state transitions & check type matching
        Order order = basket.getOrder();
        String oldStatus = order.getStatus();
        String newStatus = null;

        if ("WASHING_MACHINE".equals(equipment.getType())) {
            if ("DRYING".equals(oldStatus) || "AWAITING_DELIVERY".equals(oldStatus) || "COMPLETED".equals(oldStatus)) {
                throw new BusinessException("Đơn hàng này không cần giặt nữa.");
            }
            newStatus = "WASHING";
        } else if ("DRYER".equals(equipment.getType())) {
            if ("WASHING".equals(oldStatus) || "AWAITING_DELIVERY".equals(oldStatus) || "COMPLETED".equals(oldStatus)) {
                throw new BusinessException("Đơn hàng này cần giặt xong trước khi sấy, hoặc đã hoàn thành.");
            }
            newStatus = "DRYING";
        }

        if (newStatus != null && !oldStatus.equals(newStatus)) {
            order.setStatus(newStatus);
            orderRepository.save(order);

            com.bubbleflow.entity.OrderStateLog stateLog = com.bubbleflow.entity.OrderStateLog.builder()
                    .order(order)
                    .fromState(oldStatus)
                    .toState(newStatus)
                    .changedBy("system")
                    .changedAt(java.time.LocalDateTime.now())
                    .build();
            orderStateLogRepository.save(stateLog);
        }

        equipment.setStatus("RUNNING");
        equipmentRepository.save(equipment);

        basket.setEquipment(equipment);
        basket = basketRepository.save(basket);

        // Create equipment usage log
        EquipmentUsageLog usageLog = EquipmentUsageLog.builder()
                .equipment(equipment)
                .order(order)
                .startTime(java.time.LocalDateTime.now())
                .build();
        equipmentUsageLogRepository.save(usageLog);

        log.info("Dispatched basket {} to equipment {}", basket.getBasketCode(), equipment.getCode());
        return basketMapper.toResponse(basket);
    }

    @Override
    @Transactional
    public LaundryBasketResponse releaseFromEquipment(Long basketId) {
        LaundryBasket basket = basketRepository.findById(basketId)
                .orElseThrow(() -> new ResourceNotFoundException("LaundryBasket", "id", basketId));

        if (basket.getEquipment() == null) {
            throw new BusinessException("Giỏ đồ hiện không nằm trong thiết bị nào.");
        }

        Equipment equipment = basket.getEquipment();

        // Find all baskets currently inside this equipment
        List<LaundryBasket> basketsInEquipment = basketRepository.findByEquipmentId(equipment.getId());

        for (LaundryBasket b : basketsInEquipment) {
            b.setEquipment(null);
            basketRepository.save(b);

            Order order = b.getOrder();
            if (order != null) {
                String oldStatus = order.getStatus();
                String newStatus = null;

                if ("WASHING".equals(oldStatus) && "WASHING_MACHINE".equals(equipment.getType())) {
                    newStatus = "DRYING";
                } else if ("DRYING".equals(oldStatus) && "DRYER".equals(equipment.getType())) {
                    newStatus = "AWAITING_DELIVERY";
                }

                if (newStatus != null) {
                    order.setStatus(newStatus);
                    orderRepository.save(order);

                    com.bubbleflow.entity.OrderStateLog stateLog = com.bubbleflow.entity.OrderStateLog.builder()
                            .order(order)
                            .fromState(oldStatus)
                            .toState(newStatus)
                            .changedBy("system")
                            .changedAt(java.time.LocalDateTime.now())
                            .build();
                    orderStateLogRepository.save(stateLog);

                    // Create notification
                    String typeDesc = "WASHING_MACHINE".equals(equipment.getType()) ? "giặt" : "sấy";
                    String nextDesc = "DRYING".equals(newStatus) ? "chờ sấy" : "chờ trả đồ";
                    notificationService.createNotification(
                            "Hoàn thành " + typeDesc,
                            String.format("Đơn hàng %s đã %s xong và chuyển sang trạng thái %s.", 
                                    order.getOrderCode(), typeDesc, nextDesc),
                            "MACHINE_COMPLETED",
                            null
                    );
                }
            }
        }

        equipment.setStatus("IDLE");
        equipmentRepository.save(equipment);

        // End equipment usage log for all sessions on this equipment
        List<EquipmentUsageLog> activeLogs = equipmentUsageLogRepository.findByEquipmentIdAndEndTimeIsNull(equipment.getId());
        for (EquipmentUsageLog logEntry : activeLogs) {
            logEntry.setEndTime(java.time.LocalDateTime.now());
            long duration = java.time.Duration.between(logEntry.getStartTime(), logEntry.getEndTime()).toMinutes();
            logEntry.setDurationMinutes(duration);
            equipmentUsageLogRepository.save(logEntry);
        }

        log.info("Released all baskets ({}) from equipment {}", basketsInEquipment.size(), equipment.getCode());
        return basketMapper.toResponse(basket);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        LaundryBasket basket = basketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LaundryBasket", "id", id));
        basket.setIsActive(false);
        basketRepository.save(basket);
        log.info("Deleted (soft) laundry basket: {}", basket.getBasketCode());
    }
}
