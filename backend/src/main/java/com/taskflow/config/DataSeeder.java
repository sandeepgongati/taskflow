package com.taskflow.config;

import com.taskflow.task.Task;
import com.taskflow.task.TaskPriority;
import com.taskflow.task.TaskRepository;
import com.taskflow.task.TaskStatus;
import com.taskflow.user.Role;
import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final TaskRepository tasks;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository users, TaskRepository tasks, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.tasks = tasks;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }

        User admin = users.save(new User("Admin", "admin@taskflow.dev", passwordEncoder.encode("Admin@123"), Role.ADMIN));
        User manager = users.save(new User("Project Manager", "manager@taskflow.dev", passwordEncoder.encode("Manager@123"), Role.MANAGER));
        User member = users.save(new User("Team Member", "user@taskflow.dev", passwordEncoder.encode("User@123"), Role.USER));

        tasks.saveAll(List.of(
                new Task("Plan sprint backlog", "Prioritize user stories and define acceptance criteria.", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, LocalDate.now().plusDays(3), manager, admin),
                new Task("Build task board UI", "Create a responsive React dashboard for project tasks.", TaskStatus.TODO, TaskPriority.MEDIUM, LocalDate.now().plusDays(7), member, manager),
                new Task("Review deployment checklist", "Validate Docker, CI/CD, and production environment variables.", TaskStatus.DONE, TaskPriority.HIGH, LocalDate.now().plusDays(1), admin, admin)
        ));
    }
}

