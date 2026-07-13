package com.bubbleflow.dto.dashboard;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long todayOrders;
    private BigDecimal todayRevenue;
    private long activeMachines;
    private long slaWarnings;
    private List<DailyRevenueDto> weeklyRevenue;
    private List<ServiceRevenueShareDto> serviceRevenueShare;
    private List<MachineStatusDistributionDto> machineStatusDistribution;

    @Data
    @AllArgsConstructor
    public static class DailyRevenueDto {
        private String date;
        private BigDecimal revenue;
    }

    @Data
    @AllArgsConstructor
    public static class ServiceRevenueShareDto {
        private String serviceName;
        private BigDecimal revenue;
    }

    @Data
    @AllArgsConstructor
    public static class MachineStatusDistributionDto {
        private String status;
        private long count;
    }
}
