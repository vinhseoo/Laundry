package com.bubbleflow.dto.customer.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerStatsResponse {
    private Long id;
    private String name;
    private String phone;
    private Boolean isActive;
    private Long totalOrders;
    private BigDecimal totalSpent;
}
