package com.bubbleflow.dto.settings;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingResponse {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String description;
    private String groupName;
    private String createdAt;
    private String updatedAt;
}
