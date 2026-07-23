package com.bubbleflow.service.impl;

import com.bubbleflow.dto.customer.request.CustomerRequest;
import com.bubbleflow.dto.customer.response.CustomerResponse;
import com.bubbleflow.dto.customer.response.CustomerStatsResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.entity.Customer;
import com.bubbleflow.exception.DuplicateResourceException;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.mapper.CustomerMapper;
import com.bubbleflow.repository.CustomerRepository;
import com.bubbleflow.service.CustomerService;
import com.bubbleflow.repository.OrderRepository;
import com.bubbleflow.mapper.OrderMapper;
import com.bubbleflow.dto.order.response.OrderResponse;
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
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerStatsResponse> getAll(String search, Pageable pageable) {
        Page<CustomerRepository.CustomerStatsProjection> page = customerRepository.findCustomerStats(search, pageable);
        List<CustomerStatsResponse> content = page.getContent().stream()
                .map(p -> CustomerStatsResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .phone(p.getPhone())
                        .isActive(p.getIsActive())
                        .totalOrders(p.getTotalOrders())
                        .totalSpent(p.getTotalSpent())
                        .build())
                .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> search(String query) {
        List<Customer> list = customerRepository.searchCustomers(query);
        return customerMapper.toResponseList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return customerMapper.toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer", "phone", request.getPhone());
        }
        Customer customer = customerMapper.toEntity(request);
        customer = customerRepository.save(customer);
        log.info("Created customer: {} ({})", customer.getName(), customer.getPhone());
        return customerMapper.toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (customerRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
            throw new DuplicateResourceException("Customer", "phone", request.getPhone());
        }

        customerMapper.updateEntity(request, customer);
        customer = customerRepository.save(customer);
        log.info("Updated customer: {} ({})", customer.getName(), customer.getPhone());
        return customerMapper.toResponse(customer);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setIsActive(false);
        customerRepository.save(customer);
        log.info("Soft deleted customer: {} ({})", customer.getName(), customer.getPhone());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomerId(Long customerId) {
        List<com.bubbleflow.entity.Order> orders = orderRepository.findByCustomerId(customerId);
        return orderMapper.toResponseList(orders);
    }
}
