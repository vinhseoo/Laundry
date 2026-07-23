package com.bubbleflow.controller;

import com.bubbleflow.dto.customer.request.CustomerRequest;
import com.bubbleflow.dto.customer.response.CustomerResponse;
import com.bubbleflow.dto.customer.response.CustomerStatsResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "APIs for customer management and stats")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get all customers with stats paginated", description = "Retrieve a paginated list of customers along with order counts and total spent")
    public ResponseEntity<ApiResponse<PageResponse<CustomerStatsResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getAll(search, pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers by query", description = "Autocomplete search customers by name or phone")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> search(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.search(query)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Retrieve details for a specific customer by ID")
    public ResponseEntity<ApiResponse<CustomerResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create customer", description = "Create a new customer manually")
    public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(customerService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Update details for an existing customer")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Soft delete a customer")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{id}/orders")
    @Operation(summary = "Get customer orders history", description = "Retrieve list of all orders placed by the customer")
    public ResponseEntity<ApiResponse<List<com.bubbleflow.dto.order.response.OrderResponse>>> getOrders(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getOrdersByCustomerId(id)));
    }
}
