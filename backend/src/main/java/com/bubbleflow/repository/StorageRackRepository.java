package com.bubbleflow.repository;

import com.bubbleflow.entity.StorageRack;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StorageRackRepository extends JpaRepository<StorageRack, Long> {
    boolean existsByCode(String code);
    boolean existsByName(String name);
    boolean existsByCodeAndIdNot(String code, Long id);
    boolean existsByNameAndIdNot(String name, Long id);
    Optional<StorageRack> findByCode(String code);

    @Query("SELECT r FROM StorageRack r WHERE r.isActive = true AND " +
           "(:search IS NULL OR :search = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR r.status = :status)")
    Page<StorageRack> findWithFilters(@Param("search") String search, @Param("status") String status, Pageable pageable);

    List<StorageRack> findByStatusAndIsActiveTrue(String status);
}
