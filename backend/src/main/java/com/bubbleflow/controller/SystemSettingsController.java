package com.bubbleflow.controller;

import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.settings.SystemSettingRequest;
import com.bubbleflow.dto.settings.SystemSettingResponse;
import com.bubbleflow.service.SystemSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "APIs for managing system configuration")
public class SystemSettingsController {

    private final SystemSettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get all settings", description = "Retrieve all active system settings")
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getAllSettings()));
    }

    @GetMapping("/group/{groupName}")
    @Operation(summary = "Get settings by group", description = "Retrieve settings filtered by group name (STORE_INFO, SLA, FINANCIAL)")
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getSettingsByGroup(@PathVariable String groupName) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getSettingsByGroup(groupName)));
    }

    @PutMapping
    @Operation(summary = "Bulk update settings", description = "Update multiple settings at once by key-value pairs")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@Valid @RequestBody List<SystemSettingRequest> requests) {
        settingsService.updateSettings(requests);
        return ResponseEntity.ok(ApiResponse.ok(null, "Cập nhật cấu hình thành công"));
    }
}
