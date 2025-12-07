package com.fitlife.controller;

import com.fitlife.model.ExerciseLog;
import com.fitlife.service.ExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercise")
@CrossOrigin(origins = "*")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @GetMapping("/recent")
    public List<ExerciseLog> getRecentLogs() {
        return exerciseService.getRecentLogs();
    }

    @GetMapping("/total")
    public Map<String, Integer> getTodayTotal() {
        return Map.of("total", exerciseService.getTodayTotal());
    }

    @PostMapping("/add")
    public ResponseEntity<ExerciseLog> addExercise(@RequestBody Map<String, Object> request) {
        String type = (String) request.get("type");
        Integer duration = (Integer) request.get("duration");
        Integer calories = (Integer) request.get("calories");

        ExerciseLog log = exerciseService.addExerciseLog(type, duration, calories);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExerciseLog(id);
        return ResponseEntity.ok().build();
    }
}
