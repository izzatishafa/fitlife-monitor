package com.fitlife.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.model.MoodLog;
import com.fitlife.service.MoodService;

@RestController
@RequestMapping("/api/mood")
@CrossOrigin(origins = "*")
public class MoodController {
    
    @Autowired
    private MoodService moodService;
    
    @GetMapping("/today")
    public ResponseEntity<MoodLog> getTodayMood() {
        Optional<MoodLog> mood = moodService.getTodayMood();
        return mood.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.noContent().build());
    }
    
    @GetMapping("/average")
    public Map<String, Double> getWeeklyAverage() {
        return Map.of("average", moodService.getWeeklyAverage());
    }
    
    @PostMapping("/save")
    public ResponseEntity<MoodLog> saveMood(@RequestBody Map<String, Object> request) {
        Integer mood = (Integer) request.get("mood");
        String note = (String) request.get("note");
        MoodLog log = moodService.saveMood(mood, note);
        return ResponseEntity.ok(log);
    }
}