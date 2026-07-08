package com.bubbleflow.service;

import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    PageResponse<OrderResponse> getAll(String search, String status, Pageable pageable);
    OrderResponse getById(Long id);
    OrderResponse create(OrderRequest request);
    OrderResponse updateStatus(Long id, String status);
    List<OrderResponse> getSlaWarnings();
    void delete(Long id);
}
