package com.taskflow.task;

import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskRepository tasks;
    private final UserRepository users;

    public TaskController(TaskRepository tasks, UserRepository users) {
        this.tasks = tasks;
        this.users = users;
    }

    @GetMapping
    public List<TaskResponse> list() {
        return tasks.findAllWithUsers().stream().map(TaskResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public TaskResponse create(@Valid @RequestBody TaskRequest request, Principal principal) {
        User creator = currentUser(principal);
        User assignee = assignee(request.assigneeId());
        Task task = new Task(request.title(), request.description(), request.status(), request.priority(), request.dueDate(), assignee, creator);
        return TaskResponse.from(tasks.save(task));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        Task task = tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.update(request, assignee(request.assigneeId()));
        return TaskResponse.from(tasks.save(task));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        if (!tasks.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        tasks.deleteById(id);
    }

    private User currentUser(Principal principal) {
        return users.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private User assignee(Long assigneeId) {
        if (assigneeId == null) {
            return null;
        }
        return users.findById(assigneeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee not found"));
    }
}

