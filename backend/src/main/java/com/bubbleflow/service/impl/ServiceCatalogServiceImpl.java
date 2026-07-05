package com.bubbleflow.service.impl;

import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.dto.service.request.ServiceRequest;
import com.bubbleflow.dto.service.response.ServiceResponse;
import com.bubbleflow.entity.Service;
import com.bubbleflow.exception.DuplicateResourceException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.ServiceMapper;
import com.bubbleflow.repository.ServiceRepository;
import com.bubbleflow.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class ServiceCatalogServiceImpl implements ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final ServiceMapper serviceMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ServiceResponse> getAll(String search, Pageable pageable) {
        Page<Service> page = serviceRepository.findWithFilters(search, pageable);
        List<ServiceResponse> content = serviceMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return serviceMapper.toResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        if (serviceRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Service", "code", request.getCode());
        }
        Service service = serviceMapper.toEntity(request);
        service = serviceRepository.save(service);
        log.info("Created service: {}", service.getCode());
        return serviceMapper.toResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        if (serviceRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Service", "code", request.getCode());
        }

        serviceMapper.updateEntity(request, service);
        service = serviceRepository.save(service);
        log.info("Updated service: {}", service.getCode());
        return serviceMapper.toResponse(service);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        service.setIsActive(false);
        serviceRepository.save(service);
        log.info("Deleted (soft) service: {}", service.getCode());
    }
}
