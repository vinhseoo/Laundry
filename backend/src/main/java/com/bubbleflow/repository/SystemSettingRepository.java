package com.bubbleflow.repository;

import com.bubbleflow.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    Optional<SystemSetting> findBySettingKeyAndIsActiveTrue(String settingKey);

    List<SystemSetting> findByGroupNameAndIsActiveTrue(String groupName);

    List<SystemSetting> findByIsActiveTrue();

    boolean existsBySettingKey(String settingKey);
}
