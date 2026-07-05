package com.bubbleflow.dto.role.response;

import com.bubbleflow.dto.permission.response.PermissionResponse;
import com.bubbleflow.entity.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
    private Long id;
    private String name;
    private String description;
    private RoleType type;
    private Boolean isActive;
    private List<PermissionResponse> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
