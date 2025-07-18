package backend.service;


import backend.dto.TaskRequest;
import backend.dto.TaskResponse;
import backend.enums.TaskStatus;
import backend.security.UserPrincipal;

import java.util.List;

public interface TaskService {
    List<TaskResponse> getAllTasks(TaskStatus status, Long assigneeId);
    TaskResponse getTaskById(Long id);
    TaskResponse createTask(TaskRequest request, UserPrincipal currentUser);
    TaskResponse updateTask(Long id, TaskRequest request, UserPrincipal currentUser);
    TaskResponse updateTaskStatus(Long id, TaskStatus status, UserPrincipal currentUser);
    void deleteTask(Long id, UserPrincipal currentUser);
}

