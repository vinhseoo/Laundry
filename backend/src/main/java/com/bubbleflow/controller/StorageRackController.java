package com.bubbleflow.controller;

import com.bubbleflow.dto.storage.request.StorageRackRequest;
import com.bubbleflow.dto.storage.response.StorageRackResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.service.StorageRackService;
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
@RequestMapping("/storage-racks")
@RequiredArgsConstructor
@Tag(name = "Storage Racks", description = "APIs for completed order storage rack management")
public class StorageRackController {

    private final StorageRackService storageRackService;

    @GetMapping
    @Operation(summary = "Get all storage racks paginated", description = "Retrieve a paginated list of storage racks with search and status filters")
    public ResponseEntity<ApiResponse<PageResponse<StorageRackResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(storageRackService.getAll(search, status, pageable)));
    }

    @GetMapping("/available")
    @Operation(summary = "Get all available storage racks", description = "Retrieve a list of all active storage racks currently in AVAILABLE status")
    public ResponseEntity<ApiResponse<List<StorageRackResponse>>> getAvailableRacks() {
        return ResponseEntity.ok(ApiResponse.ok(storageRackService.getAvailableRacks()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get storage rack by ID", description = "Retrieve details for a specific storage rack by ID")
    public ResponseEntity<ApiResponse<StorageRackResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(storageRackService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create storage rack", description = "Create a new storage rack location")
    public ResponseEntity<ApiResponse<StorageRackResponse>> create(@Valid @RequestBody StorageRackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(storageRackService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update storage rack", description = "Update an existing storage rack's details")
    public ResponseEntity<ApiResponse<StorageRackResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody StorageRackRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(storageRackService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete storage rack", description = "Soft delete a storage rack")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        storageRackService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
