package com.taskflow.auth;

import com.taskflow.user.User;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        String role
) {
    static AuthResponse from(User user, String token) {
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}

