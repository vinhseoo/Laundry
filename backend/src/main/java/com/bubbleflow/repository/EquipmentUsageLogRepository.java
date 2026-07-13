package com.bubbleflow.repository;

import com.bubbleflow.entity.EquipmentUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EquipmentUsageLogRepository extends JpaRepository<EquipmentUsageLog, Long> {
    Optional<EquipmentUsageLog> findFirstByEquipmentIdAndEndTimeIsNullOrderByStartTimeDesc(Long equipmentId);

    @Query("SELECT COUNT(l) FROM EquipmentUsageLog l WHERE l.equipment.id = :equipmentId AND l.isActive = true")
    long countCyclesByEquipmentId(@Param("equipmentId") Long equipmentId);

    @Query("SELECT SUM(l.durationMinutes) FROM EquipmentUsageLog l WHERE l.equipment.id = :equipmentId AND l.isActive = true")
    Long sumDurationMinutesByEquipmentId(@Param("equipmentId") Long equipmentId);

    List<EquipmentUsageLog> findByEquipmentIdAndIsActiveTrue(Long equipmentId);
}
