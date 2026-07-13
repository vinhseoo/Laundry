package com.bubbleflow.dto.order.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveryRequest {

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // CASH, BANK_TRANSFER, MOMO

    @NotBlank(message = "Hình thức giao hàng không được để trống")
    private String deliveryType; // PICKUP, SHIPPER

    private String shipperName;
    private String shipperPhone;
}
