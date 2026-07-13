package com.bubbleflow.entity;

import com.bubbleflow.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "storage_racks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageRack extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, MAINTENANCE

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
