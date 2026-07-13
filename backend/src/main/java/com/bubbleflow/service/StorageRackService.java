package com.bubbleflow.service;

import com.bubbleflow.dto.storage.request.StorageRackRequest;
import com.bubbleflow.dto.storage.response.StorageRackResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface StorageRackService {
    PageResponse<StorageRackResponse> getAll(String search, String status, Pageable pageable);
    List<StorageRackResponse> getAvailableRacks();
    StorageRackResponse getById(Long id);
    StorageRackResponse create(StorageRackRequest request);
    StorageRackResponse update(Long id, StorageRackRequest request);
    void delete(Long id);
}
