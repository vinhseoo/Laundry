package com.bubbleflow.service.impl;

import com.bubbleflow.dto.equipment.request.EquipmentRequest;
import com.bubbleflow.dto.equipment.response.EquipmentResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Equipment;
import com.bubbleflow.exception.DuplicateResourceException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.EquipmentMapper;
import com.bubbleflow.repository.EquipmentRepository;
import com.bubbleflow.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentMapper equipmentMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> getAll(String search, String type, String status, Pageable pageable) {
        Page<Equipment> page = equipmentRepository.findWithFilters(search, type, status, pageable);
        List<EquipmentResponse> content = equipmentMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        return equipmentMapper.toResponse(equipment);
    }

    @Override
    @Transactional
    public EquipmentResponse create(EquipmentRequest request) {
        if (equipmentRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Equipment", "code", request.getCode());
        }
        Equipment equipment = equipmentMapper.toEntity(request);
        equipment = equipmentRepository.save(equipment);
        log.info("Created equipment: {}", equipment.getCode());
        return equipmentMapper.toResponse(equipment);
    }

    @Override
    @Transactional
    public EquipmentResponse update(Long id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));

        if (equipmentRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Equipment", "code", request.getCode());
        }

        equipmentMapper.updateEntity(request, equipment);
        equipment = equipmentRepository.save(equipment);
        log.info("Updated equipment: {}", equipment.getCode());
        return equipmentMapper.toResponse(equipment);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        equipment.setIsActive(false);
        equipmentRepository.save(equipment);
        log.info("Deleted (soft) equipment: {}", equipment.getCode());
    }
}
