package com.bubbleflow.repository;

import com.bubbleflow.entity.OrderStateLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderStateLogRepository extends JpaRepository<OrderStateLog, Long> {
    List<OrderStateLog> findByOrderIdOrderByChangedAtDesc(Long orderId);
    Optional<OrderStateLog> findFirstByOrderIdOrderByChangedAtDesc(Long orderId);
}
