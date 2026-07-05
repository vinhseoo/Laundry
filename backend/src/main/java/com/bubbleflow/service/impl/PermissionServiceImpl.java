package com.bubbleflow.service.impl;

import com.bubbleflow.dto.permission.response.PermissionResponse;
import com.bubbleflow.mapper.PermissionMapper;
import com.bubbleflow.repository.PermissionRepository;
import com.bubbleflow.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {
        return permissionMapper.toResponseList(permissionRepository.findAll());
    }
}
