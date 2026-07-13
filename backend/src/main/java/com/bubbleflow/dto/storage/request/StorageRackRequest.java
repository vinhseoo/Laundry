package com.bubbleflow.dto.storage.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageRackRequest {

    @NotBlank(message = "Mã kệ không được để trống")
    @Size(max = 50, message = "Mã kệ tối đa 50 ký tự")
    private String code;

    @NotBlank(message = "Tên kệ không được để trống")
    @Size(max = 100, message = "Tên kệ tối đa 100 ký tự")
    private String name;

    @Size(max = 50, message = "Trạng thái tối đa 50 ký tự")
    private String status;
}
