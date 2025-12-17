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
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<Map<String, Object>> getTodayMood(@RequestParam Long userId) {
        Optional<MoodLog> mood = moodService.getTodayMood(userId);

        if (mood.isPresent()) {
            MoodLog log = mood.get();
            return ResponseEntity.ok(Map.of(
                    "mood", log.getMood(),
                    "note", log.getNote(),
                    "date", log.getDate().toString(),
                    "logged", true));
        }

        return ResponseEntity.ok(Map.of(
                "mood", null,
                "note", null,
                "logged", false));
    }

    @GetMapping("/average")
    public ResponseEntity<Map<String, Double>> getAverage(@RequestParam Long userId) {
        Double avg = moodService.getAverageMood(userId);
        return ResponseEntity.ok(Map.of("average", avg != null ? avg : 0.0));
    }

    @PostMapping("/save")
    public ResponseEntity<MoodLog> saveMood(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Integer mood = Integer.valueOf(request.get("mood").toString());
        String note = (String) request.get("note");

        MoodLog log = moodService.saveMood(userId, mood, note);
        return ResponseEntity.ok(log);
    }
}
