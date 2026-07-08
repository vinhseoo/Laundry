package com.bubbleflow.entity;

import com.bubbleflow.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "laundry_baskets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaundryBasket extends BaseEntity {

    @Column(name = "basket_code", nullable = false, unique = true, length = 50)
    private String basketCode;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "IDLE"; // IDLE, USING

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
