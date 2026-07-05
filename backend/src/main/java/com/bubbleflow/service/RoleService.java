package com.bubbleflow.service;

import com.bubbleflow.dto.role.request.RoleRequest;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.dto.role.response.RoleResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoleService {
    PageResponse<RoleResponse> getAll(String search, Pageable pageable);
    List<RoleResponse> getAllActive();
    RoleResponse getById(Long id);
    RoleResponse create(RoleRequest request);
    RoleResponse update(Long id, RoleRequest request);
    void delete(Long id);
}
