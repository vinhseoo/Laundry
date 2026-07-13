package com.bubbleflow.service;

import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.request.OrderDeliveryRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderService {
    PageResponse<OrderResponse> getAll(String search, String status, Pageable pageable);
    OrderResponse getById(Long id);
    OrderResponse create(OrderRequest request);
    OrderResponse updateStatus(Long id, String status);
    OrderResponse assignRack(Long id, Long rackId);
    OrderResponse deliverOrder(Long id, OrderDeliveryRequest request);
    List<OrderResponse> getSlaWarnings();
    void delete(Long id);
}
