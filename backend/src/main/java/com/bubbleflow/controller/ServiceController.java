package com.bubbleflow.controller;

import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.dto.service.request.ServiceRequest;
import com.bubbleflow.dto.service.response.ServiceResponse;
import com.bubbleflow.service.ServiceCatalogService;
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

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "APIs for managing the laundry service catalog and pricing systems")
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping
    @Operation(summary = "Get all services paginated", description = "Retrieve a paginated list of services with search filter")
    public ResponseEntity<ApiResponse<PageResponse<ServiceResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCatalogService.getAll(search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID", description = "Retrieve detailed information about a specific service by ID")
    public ResponseEntity<ApiResponse<ServiceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCatalogService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create service", description = "Add a new laundry or dry cleaning service to the catalog")
    public ResponseEntity<ApiResponse<ServiceResponse>> create(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(serviceCatalogService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service", description = "Update details of an existing service by ID")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCatalogService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete service", description = "Soft delete a service from the catalog by marking it inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        serviceCatalogService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
