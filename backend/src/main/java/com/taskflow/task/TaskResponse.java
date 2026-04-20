package com.taskflow.task;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        Long assigneeId,
        String assigneeName,
        String createdByName,
        Instant createdAt
) {
    static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getAssignee() == null ? null : task.getAssignee().getId(),
                task.getAssignee() == null ? "Unassigned" : task.getAssignee().getName(),
                task.getCreatedBy().getName(),
                task.getCreatedAt()
        );
    }
}

