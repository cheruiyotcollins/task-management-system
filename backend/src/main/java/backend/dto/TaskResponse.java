package backend.dto;

import backend.enums.TaskPriority;
import backend.enums.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        UserSimpleResponse assignee,
        UserSimpleResponse creator,
        LocalDateTime createdAt,
        LocalDateTime updatedAt){}