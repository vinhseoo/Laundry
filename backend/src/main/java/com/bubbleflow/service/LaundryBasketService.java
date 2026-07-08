package com.bubbleflow.service;

import com.bubbleflow.dto.basket.request.LaundryBasketRequest;
import com.bubbleflow.dto.basket.response.LaundryBasketResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface LaundryBasketService {
    PageResponse<LaundryBasketResponse> getAll(String search, String status, Pageable pageable);
    List<LaundryBasketResponse> getActiveBaskets();
    LaundryBasketResponse getById(Long id);
    LaundryBasketResponse create(LaundryBasketRequest request);
    LaundryBasketResponse update(Long id, LaundryBasketRequest request);
    LaundryBasketResponse assignToOrder(Long basketId, Long orderId);
    LaundryBasketResponse assignToEquipment(Long basketId, Long equipmentId);
    LaundryBasketResponse releaseFromEquipment(Long basketId);
    void delete(Long id);
}
