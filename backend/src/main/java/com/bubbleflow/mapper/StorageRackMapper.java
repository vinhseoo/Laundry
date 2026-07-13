package com.bubbleflow.mapper;

import com.bubbleflow.dto.storage.request.StorageRackRequest;
import com.bubbleflow.dto.storage.response.StorageRackResponse;
import com.bubbleflow.entity.StorageRack;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface StorageRackMapper {
    StorageRackResponse toResponse(StorageRack entity);
    List<StorageRackResponse> toResponseList(List<StorageRack> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    StorageRack toEntity(StorageRackRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(StorageRackRequest request, @MappingTarget StorageRack entity);
}
