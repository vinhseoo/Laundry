package com.bubbleflow.controller;

import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.service.OrderService;
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
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "APIs for order intake and lifecycle management")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders paginated", description = "Retrieve a paginated list of laundry orders with search and status filters")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAll(search, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve details for a specific laundry order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getById(id)));
    }

    @GetMapping("/sla-warnings")
    @Operation(summary = "Get SLA warning orders", description = "Retrieve a list of all active orders currently violating their SLA limits")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getSlaWarnings() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getSlaWarnings()));
    }

    @PostMapping
    @Operation(summary = "Create order (Intake)", description = "Receive items, select services, calculate dynamic pricing, and open a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> create(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(orderService.create(request)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Transition the order state in the laundry lifecycle")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, status)));
    }

    @PutMapping("/{id}/assign-rack")
    @Operation(summary = "Assign storage rack to order", description = "Assign a specific storage rack to an awaiting delivery order")
    public ResponseEntity<ApiResponse<OrderResponse>> assignRack(
            @PathVariable Long id,
            @RequestParam Long rackId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.assignRack(id, rackId)));
    }

    @PutMapping("/{id}/delivery")
    @Operation(summary = "Deliver order", description = "Process payment and deliver/handover the laundry order")
    public ResponseEntity<ApiResponse<OrderResponse>> deliverOrder(
            @PathVariable Long id,
            @Valid @RequestBody com.bubbleflow.dto.order.request.OrderDeliveryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.deliverOrder(id, request)));
    }

    @PutMapping("/{id}/notify-customer")
    @Operation(summary = "Mark customer as notified", description = "Mark that the customer has been notified to pick up their completed laundry")
    public ResponseEntity<ApiResponse<OrderResponse>> notifyCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.notifyCustomer(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete order", description = "Soft delete an order from history")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
