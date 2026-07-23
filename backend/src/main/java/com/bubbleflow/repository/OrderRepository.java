package com.bubbleflow.repository;

import com.bubbleflow.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"items", "customer", "storageRack"})
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

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.isActive = true ORDER BY o.createdAt DESC")
    List<Order> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT o FROM Order o WHERE o.storageRack.id = :rackId AND o.isActive = true AND o.status = 'AWAITING_DELIVERY'")
    Optional<Order> findActiveOrderByStorageRackId(@Param("rackId") Long rackId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :dateTime AND o.isActive = true")
    long countByCreatedAtAfterAndIsActiveTrue(@Param("dateTime") java.time.LocalDateTime dateTime);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :dateTime AND o.isActive = true")
    java.math.BigDecimal sumTotalAmountByCreatedAtAfterAndIsActiveTrue(@Param("dateTime") java.time.LocalDateTime dateTime);

    @Query("SELECT CAST(o.createdAt AS date) as dateVal, SUM(o.totalAmount) as total " +
           "FROM Order o " +
           "WHERE o.createdAt >= :startDate AND o.isActive = true " +
           "GROUP BY CAST(o.createdAt AS date) " +
           "ORDER BY CAST(o.createdAt AS date) ASC")
    List<Object[]> getDailyRevenueForLast7Days(@Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT s.name as serviceName, SUM(oi.subtotal) as total " +
           "FROM OrderItem oi JOIN oi.service s JOIN oi.order o " +
           "WHERE o.isActive = true " +
           "GROUP BY s.name")
    List<Object[]> getServiceRevenueShare();
}
