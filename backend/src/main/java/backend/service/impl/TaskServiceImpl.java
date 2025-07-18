package backend.service.impl;

import backend.dto.TaskRequest;
import backend.dto.TaskResponse;
import backend.dto.UserSimpleResponse;
import backend.enums.TaskStatus;
import backend.exception.ResourceNotFoundException;
import backend.model.Task;
import backend.model.User;
import backend.repository.TaskRepository;
import backend.repository.UserRepository;
import backend.security.UserPrincipal;
import backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public List<TaskResponse> getAllTasks(TaskStatus status, Long assigneeId) {
        List<Task> tasks;

        if (status != null && assigneeId != null) {
            tasks = taskRepository.findByStatusAndAssignee_Id(status, assigneeId);
        } else if (status != null) {
            tasks = taskRepository.findByStatus(status);
        } else if (assigneeId != null) {
            tasks = taskRepository.findByAssignee_Id(assigneeId);
        } else {
            tasks = taskRepository.findAll();
        }

        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToResponse(task);
    }

    @Override
    public TaskResponse createTask(TaskRequest request, UserPrincipal currentUser) {
        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Creator user not found"));

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setStatus(TaskStatus.TODO);
        task.setCreator(creator);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse updateTask(Long id, TaskRequest request, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setUpdatedAt(LocalDateTime.now());

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatus status, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    public void deleteTask(Long id, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    private TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                mapUserToSimpleResponse(task.getAssignee()),
                mapUserToSimpleResponse(task.getCreator()),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    private UserSimpleResponse mapUserToSimpleResponse(User user) {
        if (user == null) return null;
        return new UserSimpleResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
