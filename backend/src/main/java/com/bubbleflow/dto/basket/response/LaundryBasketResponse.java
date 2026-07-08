package com.bubbleflow.dto.basket.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaundryBasketResponse {
    private Long id;
    private String basketCode;
    private String name;
    private Long orderId;
    private String orderCode;
    private Long equipmentId;
    private String equipmentCode;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
