package com.bubbleflow.service;

import com.bubbleflow.dto.notification.response.NotificationResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    PageResponse<NotificationResponse> getMyNotifications(Pageable pageable);
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    void createNotification(String title, String content, String type, Long userId);
}
