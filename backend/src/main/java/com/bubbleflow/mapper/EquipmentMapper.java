package com.bubbleflow.mapper;

import com.bubbleflow.dto.equipment.request.EquipmentRequest;
import com.bubbleflow.dto.equipment.response.EquipmentResponse;
import com.bubbleflow.entity.Equipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EquipmentMapper {

    EquipmentResponse toResponse(Equipment entity);

    List<EquipmentResponse> toResponseList(List<Equipment> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Equipment toEntity(EquipmentRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(EquipmentRequest request, @MappingTarget Equipment entity);
}
