package com.bubbleflow.service;

import com.bubbleflow.dto.permission.response.PermissionResponse;
import java.util.List;

public interface PermissionService {
    List<PermissionResponse> getAll();
}
