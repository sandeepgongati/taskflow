package com.taskflow.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank @Pattern(regexp = "^[A-Za-z0-9._%+-]+@taskflow\\.dev$", message = "Email must use @taskflow.dev") String email,
        @Size(min = 8) String password
) {
}
