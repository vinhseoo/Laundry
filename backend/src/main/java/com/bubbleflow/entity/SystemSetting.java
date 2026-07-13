package com.bubbleflow.entity;

import com.bubbleflow.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting extends BaseEntity {

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(name = "setting_value", nullable = false, length = 255)
    private String settingValue;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "group_name", nullable = false, length = 50)
    @Builder.Default
    private String groupName = "STORE_INFO";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
