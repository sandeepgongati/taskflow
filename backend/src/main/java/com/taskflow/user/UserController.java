package com.taskflow.user;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<UserSummary> list() {
        return users.findAll().stream()
                .map(user -> new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getCreatedAt().toString()))
                .toList();
    }

    public record UserSummary(Long id, String name, String email, String role, String createdAt) {
    }
}
