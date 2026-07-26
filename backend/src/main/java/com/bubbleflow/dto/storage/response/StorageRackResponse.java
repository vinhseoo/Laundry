package com.bubbleflow.dto.storage.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageRackResponse {
    private Long id;
    private String code;
    private String name;
    private String status;
    private Boolean isActive;
    private String currentOrderCode;
    private String currentCustomerName;
    private Long currentOrderId;
    private Boolean currentCustomerNotified;
    private LocalDateTime currentNotifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
