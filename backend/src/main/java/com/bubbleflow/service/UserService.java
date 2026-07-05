package com.bubbleflow.service;

import com.bubbleflow.dto.user.request.ChangePasswordRequest;
import com.bubbleflow.dto.user.request.ResetPasswordRequest;
import com.bubbleflow.dto.user.request.UserCreateRequest;
import com.bubbleflow.dto.user.request.UserUpdateRequest;
import com.bubbleflow.dto.user.request.UserUpdateMeRequest;
import com.bubbleflow.dto.response.PageResponse;
import com.bubbleflow.dto.user.response.UserResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    PageResponse<UserResponse> getAll(String search, Pageable pageable);
    UserResponse getById(Long id);
    UserResponse create(UserCreateRequest request);
    UserResponse update(Long id, UserUpdateRequest request);
    UserResponse updateMe(Long userId, UserUpdateMeRequest request);
    void delete(Long id);
    void changePassword(Long userId, ChangePasswordRequest request);
    void resetPassword(Long userId, ResetPasswordRequest request);
    void updateAvatar(Long userId, String avatarUrl);
    UserResponse uploadAvatar(Long userId, MultipartFile file);
}
