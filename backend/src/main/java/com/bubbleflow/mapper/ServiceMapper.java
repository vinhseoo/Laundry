package com.bubbleflow.mapper;

import com.bubbleflow.dto.service.request.ServiceRequest;
import com.bubbleflow.dto.service.response.ServiceResponse;
import com.bubbleflow.entity.Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ServiceMapper {

    ServiceResponse toResponse(Service entity);

    List<ServiceResponse> toResponseList(List<Service> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Service toEntity(ServiceRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(ServiceRequest request, @MappingTarget Service entity);
}
