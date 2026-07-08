package com.bubbleflow.repository;

import com.bubbleflow.entity.LaundryBasket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface LaundryBasketRepository extends JpaRepository<LaundryBasket, Long> {

    Optional<LaundryBasket> findByBasketCode(String basketCode);

    boolean existsByBasketCode(String basketCode);

    boolean existsByBasketCodeAndIdNot(String basketCode, Long id);

    List<LaundryBasket> findByIsActiveTrue();

    @Query("SELECT b FROM LaundryBasket b WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(b.basketCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR b.status = :status) AND " +
           "b.isActive = true")
    Page<LaundryBasket> findWithFilters(@Param("search") String search,
                                        @Param("status") String status,
                                        Pageable pageable);
}
