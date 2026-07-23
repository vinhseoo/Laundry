package com.bubbleflow.service.impl;

import com.bubbleflow.dto.notification.response.NotificationResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Notification;
import com.bubbleflow.entity.User;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.NotificationMapper;
import com.bubbleflow.repository.NotificationRepository;
import com.bubbleflow.repository.UserRepository;
import com.bubbleflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    private Long getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(Pageable pageable) {
        Long userId = getCurrentUserId();
        Page<Notification> page = notificationRepository.findByUserIdOrBroadcast(userId, pageable);
        List<NotificationResponse> content = notificationMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long userId = getCurrentUserId();
        return notificationRepository.countUnreadNotifications(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long userId = getCurrentUserId();
        notificationRepository.markAllAsRead(userId);
    }

    @Override
    @Transactional
    public void createNotification(String title, String content, String type, Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        Notification notification = Notification.builder()
                .title(title)
                .content(content)
                .type(type)
                .user(user)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        log.info("Created notification: {} (type: {})", title, type);
    }
}
