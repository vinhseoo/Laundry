package com.bubbleflow.controller;

import com.bubbleflow.dto.dashboard.DashboardStatsResponse;
import com.bubbleflow.dto.dashboard.EquipmentReportResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard Reports", description = "APIs for business reports and equipment analytics")
public class DashboardController {

    private final ReportService reportService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard summary stats", description = "Retrieve summary cards data, weekly revenue line chart, and status share breakdown")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardStats()));
    }

    @GetMapping("/equipment-report")
    @Operation(summary = "Get equipment analytical reports", description = "Retrieve total runs, runtime hours, depreciation %, and periodic maintenance projections for active devices")
    public ResponseEntity<ApiResponse<List<EquipmentReportResponse>>> getEquipmentReport() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getEquipmentReport()));
    }
}
