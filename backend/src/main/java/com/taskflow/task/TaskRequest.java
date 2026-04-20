package com.taskflow.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull TaskStatus status,
        @NotNull TaskPriority priority,
        LocalDate dueDate,
        Long assigneeId
) {
}

