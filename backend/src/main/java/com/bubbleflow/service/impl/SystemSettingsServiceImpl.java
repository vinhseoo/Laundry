package com.bubbleflow.service.impl;

import com.bubbleflow.dto.settings.SystemSettingRequest;
import com.bubbleflow.dto.settings.SystemSettingResponse;
import com.bubbleflow.entity.SystemSetting;
import com.bubbleflow.exception.ResourceNotFoundException;
import com.bubbleflow.repository.SystemSettingRepository;
import com.bubbleflow.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsServiceImpl implements SystemSettingsService {

    private static final String REDIS_PREFIX = "settings:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(60);

    private final SystemSettingRepository settingRepository;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<SystemSettingResponse> getAllSettings() {
        return settingRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemSettingResponse> getSettingsByGroup(String groupName) {
        return settingRepository.findByGroupNameAndIsActiveTrue(groupName).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemSettingResponse getByKey(String settingKey) {
        SystemSetting setting = settingRepository.findBySettingKeyAndIsActiveTrue(settingKey)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "settingKey", settingKey));
        return toResponse(setting);
    }

    @Override
    @Transactional
    public void updateSettings(List<SystemSettingRequest> requests) {
        for (SystemSettingRequest req : requests) {
            SystemSetting setting = settingRepository.findBySettingKeyAndIsActiveTrue(req.getSettingKey())
                    .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "settingKey", req.getSettingKey()));

            setting.setSettingValue(req.getSettingValue());
            settingRepository.save(setting);

            // Evict Redis cache for this key
            evictCache(req.getSettingKey());
            log.info("Updated setting: {} = {}", req.getSettingKey(), req.getSettingValue());
        }
    }

    @Override
    public String getStringSetting(String key, String defaultValue) {
        try {
            String cachedVal = stringRedisTemplate.opsForValue().get(REDIS_PREFIX + key);
            if (cachedVal != null) {
                return cachedVal;
            }
            return settingRepository.findBySettingKeyAndIsActiveTrue(key)
                    .map(setting -> {
                        cacheValue(key, setting.getSettingValue());
                        return setting.getSettingValue();
                    })
                    .orElse(defaultValue);
        } catch (Exception e) {
            log.warn("Redis unavailable for setting '{}', falling back to DB: {}", key, e.getMessage());
            return settingRepository.findBySettingKeyAndIsActiveTrue(key)
                    .map(SystemSetting::getSettingValue)
                    .orElse(defaultValue);
        }
    }

    @Override
    public int getIntegerSetting(String key, int defaultValue) {
        String val = getStringSetting(key, String.valueOf(defaultValue));
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            log.warn("Setting '{}' value '{}' is not a valid integer, returning default: {}", key, val, defaultValue);
            return defaultValue;
        }
    }

    private void cacheValue(String key, String value) {
        try {
            stringRedisTemplate.opsForValue().set(REDIS_PREFIX + key, value, CACHE_TTL);
        } catch (Exception e) {
            log.warn("Failed to cache setting '{}': {}", key, e.getMessage());
        }
    }

    private void evictCache(String key) {
        try {
            stringRedisTemplate.delete(REDIS_PREFIX + key);
        } catch (Exception e) {
            log.warn("Failed to evict cache for setting '{}': {}", key, e.getMessage());
        }
    }

    private SystemSettingResponse toResponse(SystemSetting setting) {
        return SystemSettingResponse.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .groupName(setting.getGroupName())
                .createdAt(setting.getCreatedAt() != null ? setting.getCreatedAt().toString() : null)
                .updatedAt(setting.getUpdatedAt() != null ? setting.getUpdatedAt().toString() : null)
                .build();
    }
}
