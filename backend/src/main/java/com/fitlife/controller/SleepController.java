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

import com.fitlife.model.SleepLog;
import com.fitlife.service.SleepService;

@RestController
@RequestMapping("/api/sleep")
@CrossOrigin(origins = "*")
public class SleepController {

    @Autowired
    private SleepService sleepService;

    @GetMapping("/recent")
    public List<SleepLog> getRecentLogs(@RequestParam Long userId) {
        return sleepService.getRecentLogs(userId);
    }

    @GetMapping("/average")
    public Map<String, Double> getAverageHours(@RequestParam Long userId) {
        return Map.of("average", sleepService.getAverageHours(userId));
    }

    @PostMapping("/add")
    public ResponseEntity<SleepLog> addSleep(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Double hours = ((Number) request.get("hours")).doubleValue();
        Integer quality = Integer.valueOf(request.get("quality").toString());

        SleepLog log = sleepService.addSleepLog(userId, hours, quality);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSleep(@PathVariable Long id) {
        sleepService.deleteSleepLog(id);
        return ResponseEntity.ok().build();
    }
}
