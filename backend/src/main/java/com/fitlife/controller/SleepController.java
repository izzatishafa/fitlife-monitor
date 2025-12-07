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
    public List<SleepLog> getRecentLogs() {
        return sleepService.getRecentLogs();
    }

    @GetMapping("/average")
    public Map<String, Double> getAverageHours() {
        return Map.of("average", sleepService.getAverageHours());
    }

    @PostMapping("/add")
    public ResponseEntity<SleepLog> addSleep(@RequestBody Map<String, Object> request) {
        Double hours = ((Number) request.get("hours")).doubleValue();
        Integer quality = (Integer) request.get("quality");

        SleepLog log = sleepService.addSleepLog(hours, quality);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSleep(@PathVariable Long id) {
        sleepService.deleteSleepLog(id);
        return ResponseEntity.ok().build();
    }
}