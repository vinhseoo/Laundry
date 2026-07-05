package com.bubbleflow.dto.equipment.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequest {

    @NotBlank(message = "Mã thiết bị không được để trống")
    @Size(max = 50, message = "Mã thiết bị không quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên thiết bị không được để trống")
    @Size(max = 200, message = "Tên thiết bị không quá 200 ký tự")
    private String name;

    @NotBlank(message = "Loại thiết bị không được để trống")
    @Size(max = 50, message = "Loại thiết bị không quá 50 ký tự")
    private String type; // WASHING_MACHINE, DRYER

    @NotNull(message = "Công suất không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Công suất phải lớn hơn 0")
    private Double capacity; // kg

    @NotBlank(message = "Trạng thái không được để trống")
    @Size(max = 50, message = "Trạng thái không quá 50 ký tự")
    private String status; // IDLE, RUNNING, MAINTENANCE, OUT_OF_SERVICE
}
