package com.taskflow.config;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping({"/", "/api/health"})
    public Map<String, String> health() {
        return Map.of(
                "app", "TaskFlow API",
                "status", "running",
                "time", Instant.now().toString()
        );
    }
}
