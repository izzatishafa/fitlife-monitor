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

import com.fitlife.model.WaterLog;
import com.fitlife.service.WaterService;

@RestController
@RequestMapping("/api/water")
@CrossOrigin(origins = "*")
public class WaterController {
    @Autowired
    private WaterService waterService;

    @GetMapping("/today")
    public List<WaterLog> getTodayLogs() {
        return waterService.getTodayLogs();
    }

    @GetMapping("/total")
    public Map<String, Integer> getTodayTotal() {
        return Map.of("total", waterService.getTodayTotal());
    }

    @PostMapping("/add")
    public ResponseEntity<WaterLog> addWater(@RequestBody Map<String, Integer> request) {
        Integer amount = request.get("amount");
        WaterLog log = waterService.addWaterLog(amount);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWater(@PathVariable Long id) {
        waterService.deleteWaterLog(id);
        return ResponseEntity.ok().build();
    }

}
