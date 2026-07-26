package com.bubbleflow.dto.order.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private Long customerId;
    private BigDecimal totalAmount;
    private String status;
    private String notes;
    private List<OrderItemResponse> items;
    private Long storageRackId;
    private String storageRackName;
    private String paymentStatus;
    private String paymentMethod;
    private String deliveryType;
    private String shipperName;
    private String shipperPhone;
    private LocalDateTime deliveredAt;
    private String deliveredBy;
    private Long slaRemainingMinutes;
    private Boolean slaViolated;
    private String currentDuration;
    private Boolean customerNotified;
    private LocalDateTime notifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
