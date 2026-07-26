package com.bubbleflow.service.impl;

import com.bubbleflow.dto.storage.request.StorageRackRequest;
import com.bubbleflow.dto.storage.response.StorageRackResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.StorageRack;
import com.bubbleflow.exception.BusinessException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.StorageRackMapper;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.repository.StorageRackRepository;
import com.bubbleflow.service.StorageRackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageRackServiceImpl implements StorageRackService {

    private final StorageRackRepository storageRackRepository;
    private final OrderRepository orderRepository;
    private final StorageRackMapper storageRackMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StorageRackResponse> getAll(String search, String status, Pageable pageable) {
        Page<StorageRack> page = storageRackRepository.findWithFilters(search, status, pageable);
        List<StorageRackResponse> content = page.getContent().stream()
                .map(this::toEnrichedResponse)
                .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorageRackResponse> getAvailableRacks() {
        List<StorageRack> racks = storageRackRepository.findByStatusAndIsActiveTrue("AVAILABLE");
        return storageRackMapper.toResponseList(racks);
    }

    @Override
    @Transactional(readOnly = true)
    public StorageRackResponse getById(Long id) {
        StorageRack rack = storageRackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StorageRack", "id", id));
        return toEnrichedResponse(rack);
    }

    @Override
    @Transactional
    public StorageRackResponse create(StorageRackRequest request) {
        if (storageRackRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Mã kệ đã tồn tại");
        }
        if (storageRackRepository.existsByName(request.getName())) {
            throw new BusinessException("Tên kệ đã tồn tại");
        }
        StorageRack rack = storageRackMapper.toEntity(request);
        if (rack.getStatus() == null) {
            rack.setStatus("AVAILABLE");
        }
        rack = storageRackRepository.save(rack);
        log.info("Created storage rack: {}", rack.getCode());
        return toEnrichedResponse(rack);
    }

    @Override
    @Transactional
    public StorageRackResponse update(Long id, StorageRackRequest request) {
        StorageRack rack = storageRackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StorageRack", "id", id));

        if (storageRackRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new BusinessException("Mã kệ đã tồn tại");
        }
        if (storageRackRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BusinessException("Tên kệ đã tồn tại");
        }

        storageRackMapper.updateEntity(request, rack);
        rack = storageRackRepository.save(rack);
        log.info("Updated storage rack: {}", rack.getCode());
        return toEnrichedResponse(rack);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        StorageRack rack = storageRackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StorageRack", "id", id));
        rack.setIsActive(false);
        storageRackRepository.save(rack);
        log.info("Deleted (soft) storage rack: {}", rack.getCode());
    }

    private StorageRackResponse toEnrichedResponse(StorageRack rack) {
        StorageRackResponse response = storageRackMapper.toResponse(rack);
        if ("OCCUPIED".equals(rack.getStatus())) {
            orderRepository.findActiveOrderByStorageRackId(rack.getId()).ifPresent(order -> {
                response.setCurrentOrderCode(order.getOrderCode());
                response.setCurrentCustomerName(order.getCustomerName());
                response.setCurrentOrderId(order.getId());
                response.setCurrentCustomerNotified(order.getCustomerNotified());
                response.setCurrentNotifiedAt(order.getNotifiedAt());
            });
        }
        return response;
    }
}
