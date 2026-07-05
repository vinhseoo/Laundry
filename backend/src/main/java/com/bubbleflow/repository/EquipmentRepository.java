package com.bubbleflow.repository;

import com.bubbleflow.entity.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Optional<Equipment> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT e FROM Equipment e WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(e.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR :type = '' OR e.type = :type) AND " +
           "(:status IS NULL OR :status = '' OR e.status = :status)")
    Page<Equipment> findWithFilters(@Param("search") String search,
                                    @Param("type") String type,
                                    @Param("status") String status,
                                    Pageable pageable);
}
