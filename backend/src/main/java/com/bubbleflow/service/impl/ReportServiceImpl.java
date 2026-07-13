package com.bubbleflow.service.impl;

import com.bubbleflow.dto.dashboard.DashboardStatsResponse;
import com.bubbleflow.dto.dashboard.EquipmentReportResponse;
import com.bubbleflow.entity.Equipment;
import com.bubbleflow.entity.Order;
import com.bubbleflow.repository.EquipmentRepository;
import com.bubbleflow.repository.EquipmentUsageLogRepository;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.service.OrderService;
import com.bubbleflow.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final EquipmentRepository equipmentRepository;
    private final OrderRepository orderRepository;
    private final EquipmentUsageLogRepository equipmentUsageLogRepository;
    private final OrderService orderService;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long todayOrders = getTodayOrderCount();
        BigDecimal todayRevenue = getTodayRevenue();

        List<Equipment> allEquipments = equipmentRepository.findAll().stream()
                .filter(Equipment::getIsActive)
                .toList();

        long activeMachines = allEquipments.stream()
                .filter(e -> "RUNNING".equals(e.getStatus()))
                .count();

        long slaWarnings = orderService.getSlaWarnings().size();

        // Weekly Revenue (last 7 days)
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(6).atStartOfDay();
        List<Object[]> dailyResults = orderRepository.getDailyRevenueForLast7Days(sevenDaysAgo);
        Map<String, BigDecimal> dailyMap = new HashMap<>();
        for (Object[] res : dailyResults) {
            if (res[0] != null && res[1] != null) {
                dailyMap.put(res[0].toString(), (BigDecimal) res[1]);
            }
        }
        
        List<DashboardStatsResponse.DailyRevenueDto> weeklyRevenue = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateStr = date.toString();
            BigDecimal amount = dailyMap.getOrDefault(dateStr, BigDecimal.ZERO);
            weeklyRevenue.add(new DashboardStatsResponse.DailyRevenueDto(dateStr, amount));
        }

        // Service Revenue Share
        List<Object[]> serviceResults = orderRepository.getServiceRevenueShare();
        List<DashboardStatsResponse.ServiceRevenueShareDto> serviceShare = serviceResults.stream()
                .filter(res -> res[0] != null && res[1] != null)
                .map(res -> new DashboardStatsResponse.ServiceRevenueShareDto((String) res[0], (BigDecimal) res[1]))
                .toList();

        // Machine Status Distribution
        Map<String, Long> statusCounts = new HashMap<>();
        for (Equipment eq : allEquipments) {
            statusCounts.put(eq.getStatus(), statusCounts.getOrDefault(eq.getStatus(), 0L) + 1);
        }
        
        List<DashboardStatsResponse.MachineStatusDistributionDto> statusDistribution = statusCounts.entrySet().stream()
                .map(entry -> new DashboardStatsResponse.MachineStatusDistributionDto(entry.getKey(), entry.getValue()))
                .toList();

        return DashboardStatsResponse.builder()
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue)
                .activeMachines(activeMachines)
                .slaWarnings(slaWarnings)
                .weeklyRevenue(weeklyRevenue)
                .serviceRevenueShare(serviceShare)
                .machineStatusDistribution(statusDistribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentReportResponse> getEquipmentReport() {
        List<Equipment> allEquipments = equipmentRepository.findAll().stream()
                .filter(Equipment::getIsActive)
                .toList();

        return allEquipments.stream()
                .map(this::calculateEquipmentMetrics)
                .toList();
    }

    private EquipmentReportResponse calculateEquipmentMetrics(Equipment eq) {
        long totalCycles = equipmentUsageLogRepository.countCyclesByEquipmentId(eq.getId());
        Long totalMinutes = equipmentUsageLogRepository.sumDurationMinutesByEquipmentId(eq.getId());
        if (totalMinutes == null) {
            totalMinutes = 0L;
        }
        double totalHours = totalMinutes / 60.0;
        
        // Depreciation based on run hours (assume standard lifetime is 2000 hours)
        double depreciationPercent = Math.min(100.0, (totalHours / 2000.0) * 100.0);
        
        // Wear Rate status
        String wearRate = "LOW";
        if (depreciationPercent > 75.0) {
            wearRate = "CRITICAL";
        } else if (depreciationPercent > 50.0) {
            wearRate = "HIGH";
        } else if (depreciationPercent > 25.0) {
            wearRate = "MEDIUM";
        }
        
        // Maintenance prediction (maintenance required every 100 hours of run time)
        double hoursToNextMaintenance = 100.0 - (totalHours % 100.0);
        
        String maintenanceStatus = "OK";
        if ("OUT_OF_SERVICE".equals(eq.getStatus())) {
            maintenanceStatus = "OVERDUE";
            hoursToNextMaintenance = 0.0;
        } else if (hoursToNextMaintenance < 10.0) {
            maintenanceStatus = "DUE_SOON";
        } else if (hoursToNextMaintenance <= 0.0) {
            maintenanceStatus = "OVERDUE";
        }

        // Round decimals to 2 places
        totalHours = Math.round(totalHours * 100.0) / 100.0;
        depreciationPercent = Math.round(depreciationPercent * 100.0) / 100.0;
        hoursToNextMaintenance = Math.round(hoursToNextMaintenance * 100.0) / 100.0;

        return EquipmentReportResponse.builder()
                .id(eq.getId())
                .code(eq.getCode())
                .name(eq.getName())
                .type(eq.getType())
                .status(eq.getStatus())
                .totalCycles(totalCycles)
                .totalRuntimeHours(totalHours)
                .depreciationPercent(depreciationPercent)
                .wearRate(wearRate)
                .hoursToNextMaintenance(hoursToNextMaintenance)
                .maintenanceStatus(maintenanceStatus)
                .build();
    }

    private long getTodayOrderCount() {
        try {
            String todayStr = LocalDate.now().toString();
            String key = "dashboard:stats:order_count:" + todayStr;
            String val = stringRedisTemplate.opsForValue().get(key);
            if (val == null) {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                long count = orderRepository.countByCreatedAtAfterAndIsActiveTrue(startOfDay);
                stringRedisTemplate.opsForValue().set(key, String.valueOf(count), Duration.ofDays(1));
                return count;
            }
            return Long.parseLong(val);
        } catch (Exception e) {
            log.warn("Failed to get order count from Redis: {}", e.getMessage());
            return orderRepository.countByCreatedAtAfterAndIsActiveTrue(LocalDate.now().atStartOfDay());
        }
    }

    private BigDecimal getTodayRevenue() {
        try {
            String todayStr = LocalDate.now().toString();
            String key = "dashboard:stats:revenue:" + todayStr;
            String val = stringRedisTemplate.opsForValue().get(key);
            if (val == null) {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                BigDecimal revenue = orderRepository.sumTotalAmountByCreatedAtAfterAndIsActiveTrue(startOfDay);
                if (revenue == null) {
                    revenue = BigDecimal.ZERO;
                }
                stringRedisTemplate.opsForValue().set(key, revenue.toString(), Duration.ofDays(1));
                return revenue;
            }
            return new BigDecimal(val);
        } catch (Exception e) {
            log.warn("Failed to get revenue from Redis: {}", e.getMessage());
            BigDecimal revenue = orderRepository.sumTotalAmountByCreatedAtAfterAndIsActiveTrue(LocalDate.now().atStartOfDay());
            return revenue != null ? revenue : BigDecimal.ZERO;
        }
    }
}
