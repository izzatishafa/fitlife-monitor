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
    public List<ExerciseLog> getRecentLogs(@RequestParam Long userId) {
        return exerciseService.getRecentLogs(userId);
    }

    @GetMapping("/total")
    public Map<String, Integer> getTodayTotal(@RequestParam Long userId) {
        return Map.of("total", exerciseService.getTodayTotal(userId));
    }

    @PostMapping("/add")
    public ResponseEntity<ExerciseLog> addExercise(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String type = (String) request.get("type");
        Integer duration = Integer.valueOf(request.get("duration").toString());
        Integer calories = Integer.valueOf(request.get("calories").toString());

        ExerciseLog log = exerciseService.addExerciseLog(userId, type, duration, calories);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExerciseLog(id);
        return ResponseEntity.ok().build();
    }
}
