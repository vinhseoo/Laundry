package com.bubbleflow.dto.dashboard;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentReportResponse {
    private Long id;
    private String code;
    private String name;
    private String type;
    private String status;
    private long totalCycles;
    private double totalRuntimeHours;
    private double depreciationPercent;
    private String wearRate; // LOW, MEDIUM, HIGH, CRITICAL
    private double hoursToNextMaintenance;
    private String maintenanceStatus; // OK, DUE_SOON, OVERDUE
}
