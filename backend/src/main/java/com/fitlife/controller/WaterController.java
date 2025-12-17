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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.model.WaterLog;
import com.fitlife.service.WaterService;

@RestController
@RequestMapping("/api/water")
@CrossOrigin(origins = "*")
public class WaterController {
    @Autowired
    private WaterService waterService;

    // ✨ GET TODAY'S LOGS - Pass userId as query parameter
    @GetMapping("/today")
    public List<WaterLog> getTodayLogs(@RequestParam Long userId) {
        return waterService.getTodayLogs(userId);
    }

    // ✨ GET TODAY'S TOTAL - Pass userId as query parameter
    @GetMapping("/total")
    public Map<String, Integer> getTodayTotal(@RequestParam Long userId) {
        return Map.of("total", waterService.getTodayTotal(userId));
    }

    // ✨ ADD WATER - Get userId from request body
    @PostMapping("/add")
    public ResponseEntity<WaterLog> addWater(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Integer amount = Integer.valueOf(request.get("amount").toString());
        WaterLog log = waterService.addWaterLog(userId, amount);
        return ResponseEntity.ok(log);
    }

    // ✨ DELETE WATER - Consider adding userId check for security
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWater(@PathVariable Long id) {
        waterService.deleteWaterLog(id);
        return ResponseEntity.ok().build();
    }
}