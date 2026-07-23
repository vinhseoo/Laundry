package com.bubbleflow.mapper;

import com.bubbleflow.dto.notification.response.NotificationResponse;
import com.bubbleflow.entity.Notification;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface NotificationMapper {

    NotificationResponse toResponse(Notification entity);

    List<NotificationResponse> toResponseList(List<Notification> entities);
}
