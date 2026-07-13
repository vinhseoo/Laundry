package com.bubbleflow.service;

import com.bubbleflow.dto.settings.SystemSettingRequest;
import com.bubbleflow.dto.settings.SystemSettingResponse;
import java.util.List;

public interface SystemSettingsService {

    List<SystemSettingResponse> getAllSettings();

    List<SystemSettingResponse> getSettingsByGroup(String groupName);

    SystemSettingResponse getByKey(String settingKey);

    void updateSettings(List<SystemSettingRequest> requests);

    /**
     * Helper to get a setting value as String. Returns defaultValue if not found.
     */
    String getStringSetting(String key, String defaultValue);

    /**
     * Helper to get a setting value as int. Returns defaultValue if not found or not parseable.
     */
    int getIntegerSetting(String key, int defaultValue);
}
