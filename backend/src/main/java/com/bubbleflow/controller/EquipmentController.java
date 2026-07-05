package com.bubbleflow.controller;

import com.bubbleflow.dto.equipment.request.EquipmentRequest;
import com.bubbleflow.dto.equipment.response.EquipmentResponse;
import com.bubbleflow.dto.response.ApiResponse;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.service.EquipmentService;
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
@RequestMapping("/equipment")
@RequiredArgsConstructor
@Tag(name = "Equipment", description = "APIs for managing and monitoring laundry washing and drying machinery")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    @Operation(summary = "Get all equipment paginated", description = "Retrieve a paginated list of machines with filters for search, type and status")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getAll(search, type, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get equipment by ID", description = "Retrieve details for a specific machine by ID")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create equipment", description = "Add a new machine to the shop catalog")
    public ResponseEntity<ApiResponse<EquipmentResponse>> create(@Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(equipmentService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update equipment", description = "Update technical and operational properties of a machine by ID")
    public ResponseEntity<ApiResponse<EquipmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete equipment", description = "Soft delete a machine from the shop catalog by marking it inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
