package com.bubbleflow.dto.settings;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingRequest {

    @NotBlank(message = "Setting key không được để trống")
    @Size(max = 100)
    private String settingKey;

    @NotBlank(message = "Setting value không được để trống")
    @Size(max = 255)
    private String settingValue;
}
