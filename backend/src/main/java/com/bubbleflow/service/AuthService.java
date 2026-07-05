package com.bubbleflow.service;

import com.bubbleflow.dto.auth.request.LoginRequest;
import com.bubbleflow.dto.auth.request.RefreshTokenRequest;
import com.bubbleflow.dto.auth.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    void logout(String refreshToken);
}
