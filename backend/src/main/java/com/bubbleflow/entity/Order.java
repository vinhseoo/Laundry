package com.bubbleflow.entity;

import com.bubbleflow.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "RECEIVED"; // RECEIVED, SORTING, WASHING, DRYING, AWAITING_DELIVERY, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "storage_rack_id")
    private StorageRack storageRack;

    @Column(name = "payment_status", nullable = false, length = 50)
    @Builder.Default
    private String paymentStatus = "UNPAID"; // UNPAID, PAID

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "delivery_type", nullable = false, length = 50)
    @Builder.Default
    private String deliveryType = "PICKUP"; // PICKUP, SHIPPER

    @Column(name = "shipper_name", length = 150)
    private String shipperName;

    @Column(name = "shipper_phone", length = 50)
    private String shipperPhone;

    @Column(name = "delivered_at")
    private java.time.LocalDateTime deliveredAt;

    @Column(name = "delivered_by", length = 100)
    private String deliveredBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "customer_notified", nullable = false)
    @Builder.Default
    private Boolean customerNotified = false;

    @Column(name = "notified_at")
    private java.time.LocalDateTime notifiedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
