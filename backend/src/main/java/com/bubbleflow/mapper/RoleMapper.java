package com.bubbleflow.mapper;

import com.bubbleflow.dto.permission.response.PermissionResponse;
import com.bubbleflow.dto.role.request.RoleRequest;
import com.bubbleflow.dto.role.response.RoleResponse;
import com.bubbleflow.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class}, builder = @org.mapstruct.Builder(disableBuilder = true))
public interface RoleMapper {

    @Mapping(target = "permissions", source = "permissions")
    RoleResponse toResponse(Role entity, List<PermissionResponse> permissions);

    RoleResponse toResponse(Role entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Role toEntity(RoleRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(RoleRequest request, @MappingTarget Role entity);
}
