package com.bubbleflow.dto.basket.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaundryBasketRequest {

    @NotBlank(message = "Basket code is required")
    private String basketCode;

    private String name;

    private String status;

    private Long orderId;

    private Long equipmentId;
}
