package com.bubbleflow.service;

import com.bubbleflow.dto.equipment.request.EquipmentRequest;
import com.bubbleflow.dto.equipment.response.EquipmentResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface EquipmentService {
    PageResponse<EquipmentResponse> getAll(String search, String type, String status, Pageable pageable);
    EquipmentResponse getById(Long id);
    EquipmentResponse create(EquipmentRequest request);
    EquipmentResponse update(Long id, EquipmentRequest request);
    void delete(Long id);
}
