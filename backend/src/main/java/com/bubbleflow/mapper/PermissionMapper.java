package com.bubbleflow.mapper;

import com.bubbleflow.dto.permission.response.PermissionResponse;
import com.bubbleflow.entity.Permission;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionResponse toResponse(Permission entity);

    List<PermissionResponse> toResponseList(List<Permission> entities);
}
