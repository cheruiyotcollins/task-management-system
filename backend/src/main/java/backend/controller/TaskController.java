package backend.controller;

import backend.dto.TaskRequest;
import backend.dto.TaskResponse;
import backend.enums.TaskStatus;
import backend.security.CurrentUser;
import backend.security.UserPrincipal;
import backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long assigneeId) {
        return ResponseEntity.ok(taskService.getAllTasks(status, assigneeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(taskService.updateTask(id, request, currentUser));
    }



    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, currentUser));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}