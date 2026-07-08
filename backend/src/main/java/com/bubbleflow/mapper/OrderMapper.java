package com.bubbleflow.mapper;

import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.response.OrderItemResponse;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.entity.Order;
import com.bubbleflow.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface OrderMapper {

    @Mapping(target = "items", source = "items")
    OrderResponse toResponse(Order entity);

    List<OrderResponse> toResponseList(List<Order> entities);

    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceName", source = "service.name")
    @Mapping(target = "serviceCode", source = "service.code")
    OrderItemResponse toItemResponse(OrderItem entity);

    List<OrderItemResponse> toItemResponseList(List<OrderItem> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "orderCode", ignore = true)
    Order toEntity(OrderRequest request);
}
