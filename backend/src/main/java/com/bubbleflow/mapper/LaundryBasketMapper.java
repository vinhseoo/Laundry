package com.bubbleflow.mapper;

import com.bubbleflow.dto.basket.request.LaundryBasketRequest;
import com.bubbleflow.dto.basket.response.LaundryBasketResponse;
import com.bubbleflow.entity.LaundryBasket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface LaundryBasketMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "orderCode", source = "order.orderCode")
    @Mapping(target = "equipmentId", source = "equipment.id")
    @Mapping(target = "equipmentCode", source = "equipment.code")
    LaundryBasketResponse toResponse(LaundryBasket entity);

    List<LaundryBasketResponse> toResponseList(List<LaundryBasket> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "equipment", ignore = true)
    LaundryBasket toEntity(LaundryBasketRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "equipment", ignore = true)
    void updateEntity(LaundryBasketRequest request, @MappingTarget LaundryBasket entity);
}
