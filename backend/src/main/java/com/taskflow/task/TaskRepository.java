package com.taskflow.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("""
            select t from Task t
            left join fetch t.assignee
            join fetch t.createdBy
            order by t.createdAt desc
            """)
    List<Task> findAllWithUsers();
}

