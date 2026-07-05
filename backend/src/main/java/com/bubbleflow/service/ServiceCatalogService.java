package com.bubbleflow.service;

import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.dto.service.request.ServiceRequest;
import com.bubbleflow.dto.service.response.ServiceResponse;
import org.springframework.data.domain.Pageable;

public interface ServiceCatalogService {
    PageResponse<ServiceResponse> getAll(String search, Pageable pageable);
    ServiceResponse getById(Long id);
    ServiceResponse create(ServiceRequest request);
    ServiceResponse update(Long id, ServiceRequest request);
    void delete(Long id);
}
