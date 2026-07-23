package com.bubbleflow.dto.customer.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 150, message = "Tên khách hàng không được vượt quá 150 ký tự")
    private String name;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9+()#&.\\s-]{9,15}$", message = "Số điện thoại không hợp lệ")
    private String phone;
}
