package com.bubbleflow.controller;

import com.bubbleflow.dto.notification.response.NotificationResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "APIs for operator notification center")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get my notifications", description = "Retrieve list of broadcast and user-specific notifications")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getMyNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications(pageable)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Count how many unread notifications are waiting")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount()));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read", description = "Mark a notification as read by ID")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications for the current user as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
