package com.bubbleflow.service;

import com.bubbleflow.dto.customer.request.CustomerRequest;
import com.bubbleflow.dto.customer.response.CustomerResponse;
import com.bubbleflow.dto.customer.response.CustomerStatsResponse;
import com.bubbleflow.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CustomerService {
    PageResponse<CustomerStatsResponse> getAll(String search, Pageable pageable);
    List<CustomerResponse> search(String query);
    CustomerResponse getById(Long id);
    CustomerResponse create(CustomerRequest request);
    CustomerResponse update(Long id, CustomerRequest request);
    void delete(Long id);
    List<com.bubbleflow.dto.order.response.OrderResponse> getOrdersByCustomerId(Long customerId);
}
