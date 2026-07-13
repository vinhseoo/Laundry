package com.bubbleflow.repository;

import com.bubbleflow.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR o.status = :status) AND " +
           "o.isActive = true")
    Page<Order> findWithFilters(@Param("search") String search,
                                @Param("status") String status,
                                Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.storageRack.id = :rackId AND o.isActive = true AND o.status = 'AWAITING_DELIVERY'")
    Optional<Order> findActiveOrderByStorageRackId(@Param("rackId") Long rackId);
}
