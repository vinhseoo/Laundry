package com.bubbleflow.service;

import com.bubbleflow.dto.dashboard.DashboardStatsResponse;
import com.bubbleflow.dto.dashboard.EquipmentReportResponse;
import java.util.List;

public interface ReportService {
    DashboardStatsResponse getDashboardStats();
    List<EquipmentReportResponse> getEquipmentReport();
}
