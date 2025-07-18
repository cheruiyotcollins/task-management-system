package backend.dto;

import backend.enums.TaskPriority;
import backend.enums.TaskStatus;

public record TaskRequest(
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        Long assigneeId) {}
