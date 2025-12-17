package com.fitlife.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.model.CaloriesLog;
import com.fitlife.service.CaloriesService;

@RestController
@RequestMapping("/api/calories")
@CrossOrigin(origins = "*")
public class CaloriesController {

    @Autowired
    private CaloriesService caloriesService;

    @GetMapping("/today")
    public List<CaloriesLog> getTodayLogs(@RequestParam Long userId) {
        return caloriesService.getTodayLogs(userId);
    }

    @GetMapping("/total")
    public Map<String, Integer> getTodayTotal(@RequestParam Long userId) {
        return Map.of("total", caloriesService.getTodayTotal(userId));
    }

    @PostMapping("/add")
    public ResponseEntity<CaloriesLog> addCalories(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String foodName = (String) request.get("foodName");
        Integer calories = Integer.valueOf(request.get("calories").toString());

        CaloriesLog log = caloriesService.addCaloriesLog(userId, foodName, calories);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCalories(@PathVariable Long id) {
        caloriesService.deleteCaloriesLog(id);
        return ResponseEntity.ok().build();
    }
}
