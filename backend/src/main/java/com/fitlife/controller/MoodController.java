package com.fitlife.controller;

import java.util.HashMap;
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
    public ResponseEntity<Map<String, Object>> getTodayMood() {
        Optional<MoodLog> mood = moodService.getTodayMood();

        if (mood.isPresent()) {
            MoodLog log = mood.get();
            Map<String, Object> response = new HashMap<>();
            response.put("mood", log.getMood());
            response.put("note", log.getNote());
            response.put("date", log.getDate().toString());
            return ResponseEntity.ok(response);
        } else {
            // Return empty data instead of 204 No Content
            Map<String, Object> emptyResponse = new HashMap<>();
            emptyResponse.put("mood", null);
            emptyResponse.put("note", null);
            emptyResponse.put("logged", false);
            return ResponseEntity.ok(emptyResponse);
        }
    }

    @GetMapping("/average")
    public ResponseEntity<Map<String, Double>> getWeeklyAverage() {
        Double avg = moodService.getWeeklyAverage();
        // Always return a valid response
        return ResponseEntity.ok(Map.of("average", avg != null ? avg : 0.0));
    }

    @PostMapping("/save")
    public ResponseEntity<MoodLog> saveMood(@RequestBody Map<String, Object> request) {
        Integer mood = (Integer) request.get("mood");
        String note = (String) request.get("note");
        MoodLog log = moodService.saveMood(mood, note);
        return ResponseEntity.ok(log);
    }
}