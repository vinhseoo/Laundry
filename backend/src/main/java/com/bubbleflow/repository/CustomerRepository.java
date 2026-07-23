package com.bubbleflow.repository;

import com.bubbleflow.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    @Query("SELECT c FROM Customer c WHERE c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR c.phone LIKE CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("query") String query);

    @Query(value = "SELECT c.id as id, c.name as name, c.phone as phone, c.is_active as isActive, " +
           "COUNT(o.id) as totalOrders, COALESCE(SUM(o.total_amount), 0) as totalSpent " +
           "FROM customers c " +
           "LEFT JOIN orders o ON o.customer_id = c.id AND o.is_active = true " +
           "WHERE (:search IS NULL OR :search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR c.phone LIKE CONCAT('%', :search, '%')) " +
           "GROUP BY c.id, c.name, c.phone, c.is_active",
           countQuery = "SELECT COUNT(c.id) FROM customers c " +
                        "WHERE (:search IS NULL OR :search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR c.phone LIKE CONCAT('%', :search, '%'))",
           nativeQuery = true)
    Page<CustomerStatsProjection> findCustomerStats(@Param("search") String search, Pageable pageable);

    interface CustomerStatsProjection {
        Long getId();
        String getName();
        String getPhone();
        Boolean getIsActive();
        Long getTotalOrders();
        java.math.BigDecimal getTotalSpent();
    }
}
