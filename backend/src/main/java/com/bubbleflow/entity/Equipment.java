package com.bubbleflow.entity;

import com.bubbleflow.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "equipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // e.g. WASHING_MACHINE, DRYER

    @Column(name = "capacity", nullable = false)
    private Double capacity; // e.g. 11.0, 15.0 kg

    @Column(name = "status", nullable = false, length = 50)
    private String status; // e.g. IDLE, RUNNING, MAINTENANCE, OUT_OF_SERVICE

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
