package backend.repository;

import backend.enums.TaskStatus;
import backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatusAndAssignee_Id(TaskStatus status, Long assigneeId);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByAssignee_Id(Long assigneeId);

}
