package com.bubbleflow.controller;

import com.bubbleflow.dto.basket.request.LaundryBasketRequest;
import com.bubbleflow.dto.basket.response.LaundryBasketResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.service.LaundryBasketService;
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
@RequestMapping("/baskets")
@RequiredArgsConstructor
@Tag(name = "Baskets", description = "APIs for managing laundry baskets and machine dispatching")
public class LaundryBasketController {

    private final LaundryBasketService basketService;

    @GetMapping
    @Operation(summary = "Get all baskets paginated", description = "Retrieve a paginated list of laundry baskets with search and status filters")
    public ResponseEntity<ApiResponse<PageResponse<LaundryBasketResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(basketService.getAll(search, status, pageable)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active baskets", description = "Retrieve a list of all active laundry baskets")
    public ResponseEntity<ApiResponse<List<LaundryBasketResponse>>> getActiveBaskets() {
        return ResponseEntity.ok(ApiResponse.ok(basketService.getActiveBaskets()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get basket by ID", description = "Retrieve details for a specific laundry basket by ID")
    public ResponseEntity<ApiResponse<LaundryBasketResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(basketService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create basket", description = "Add a new laundry basket to the shop")
    public ResponseEntity<ApiResponse<LaundryBasketResponse>> create(@Valid @RequestBody LaundryBasketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(basketService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update basket config", description = "Update code and name of a laundry basket")
    public ResponseEntity<ApiResponse<LaundryBasketResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody LaundryBasketRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(basketService.update(id, request)));
    }

    @PutMapping("/{id}/assign-order")
    @Operation(summary = "Assign basket to order", description = "Link a laundry basket to a customer order (pass null or omit orderId query param to unassign)")
    public ResponseEntity<ApiResponse<LaundryBasketResponse>> assignToOrder(
            @PathVariable Long id,
            @RequestParam(required = false) Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok(basketService.assignToOrder(id, orderId)));
    }

    @PutMapping("/{id}/assign-equipment/{equipmentId}")
    @Operation(summary = "Dispatch basket to equipment", description = "Load the basket into a washing or drying machine (updates machine status to RUNNING)")
    public ResponseEntity<ApiResponse<LaundryBasketResponse>> assignToEquipment(
            @PathVariable Long id,
            @PathVariable Long equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(basketService.assignToEquipment(id, equipmentId)));
    }

    @PutMapping("/{id}/release")
    @Operation(summary = "Release basket from equipment", description = "Unload the basket from the machine after operation completion (resets machine status to IDLE)")
    public ResponseEntity<ApiResponse<LaundryBasketResponse>> releaseFromEquipment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(basketService.releaseFromEquipment(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete basket", description = "Soft delete a laundry basket")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        basketService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
