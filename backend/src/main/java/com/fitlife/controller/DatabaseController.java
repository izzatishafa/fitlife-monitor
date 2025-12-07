package com.fitlife.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.repository.CaloriesRepository;
import com.fitlife.repository.ExerciseRepository;
import com.fitlife.repository.MoodRepository;
import com.fitlife.repository.SleepRepository;
import com.fitlife.repository.WaterRepository;

@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "*")
public class DatabaseController {

    @Autowired
    private WaterRepository waterRepository;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private SleepRepository sleepRepository;
    @Autowired
    private CaloriesRepository caloriesRepository;
    @Autowired
    private MoodRepository moodRepository;

    // Get database statistics
    @GetMapping("/stats")
    public Map<String, Object> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("waterLogs", waterRepository.count());
        stats.put("exerciseLogs", exerciseRepository.count());
        stats.put("sleepLogs", sleepRepository.count());
        stats.put("caloriesLogs", caloriesRepository.count());
        stats.put("moodLogs", moodRepository.count());
        stats.put("totalRecords",
                waterRepository.count() +
                        exerciseRepository.count() +
                        sleepRepository.count() +
                        caloriesRepository.count() +
                        moodRepository.count());

        // Calculate date range
        stats.put("oldestRecord", getOldestRecordDate());
        stats.put("newestRecord", LocalDate.now().toString());

        return stats;
    }

    // Export all data as CSV
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCSV() {
        StringBuilder csv = new StringBuilder();

        // Headers
        csv.append("Type,Date,Time,Value1,Value2,Value3,Note\n");

        // Water logs
        waterRepository.findAll().forEach(log -> {
            csv.append(String.format("Water,%s,%s,%d,,,\n",
                    log.getDate(), log.getTime(), log.getAmount()));
        });

        // Exercise logs
        exerciseRepository.findAll().forEach(log -> {
            csv.append(String.format("Exercise,%s,%s,%s,%d,%d,\n",
                    log.getDate(), log.getTime(), log.getType(), log.getDuration(), log.getCalories()));
        });

        // Sleep logs
        sleepRepository.findAll().forEach(log -> {
            csv.append(String.format("Sleep,%s,,%.1f,%d,,\n",
                    log.getDate(), log.getHours(), log.getQuality()));
        });

        // Calories logs
        caloriesRepository.findAll().forEach(log -> {
            csv.append(String.format("Calories,%s,%s,%d,,,%s\n",
                    log.getDate(), log.getTime(), log.getCalories(), log.getFoodName()));
        });

        // Mood logs
        moodRepository.findAll().forEach(log -> {
            csv.append(String.format("Mood,%s,,%d,,,%s\n",
                    log.getDate(), log.getMood(), log.getNote() != null ? log.getNote() : ""));
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "fitlife_data_" + LocalDate.now() + ".csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }

    // Export all data as JSON
    @GetMapping("/export/json")
    public Map<String, Object> exportToJSON() {
        Map<String, Object> data = new HashMap<>();

        data.put("exportDate", LocalDate.now().toString());
        data.put("water", waterRepository.findAll());
        data.put("exercise", exerciseRepository.findAll());
        data.put("sleep", sleepRepository.findAll());
        data.put("calories", caloriesRepository.findAll());
        data.put("mood", moodRepository.findAll());

        return data;
    }

    // Delete all data (with confirmation)
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllData(@RequestParam String confirmation) {
        if (!"DELETE_ALL_DATA".equals(confirmation)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid confirmation code"));
        }

        waterRepository.deleteAll();
        exerciseRepository.deleteAll();
        sleepRepository.deleteAll();
        caloriesRepository.deleteAll();
        moodRepository.deleteAll();

        return ResponseEntity.ok(Map.of("message", "All data deleted successfully"));
    }

    // Delete old data (older than X days)
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldData(@RequestParam int olderThanDays) {
        LocalDate cutoffDate = LocalDate.now().minusDays(olderThanDays);

        long waterDeleted = waterRepository.findAll().stream()
                .filter(log -> log.getDate().isBefore(cutoffDate))
                .peek(waterRepository::delete)
                .count();

        long exerciseDeleted = exerciseRepository.findAll().stream()
                .filter(log -> log.getDate().isBefore(cutoffDate))
                .peek(exerciseRepository::delete)
                .count();

        long sleepDeleted = sleepRepository.findAll().stream()
                .filter(log -> log.getDate().isBefore(cutoffDate))
                .peek(sleepRepository::delete)
                .count();

        long caloriesDeleted = caloriesRepository.findAll().stream()
                .filter(log -> log.getDate().isBefore(cutoffDate))
                .peek(caloriesRepository::delete)
                .count();

        long moodDeleted = moodRepository.findAll().stream()
                .filter(log -> log.getDate().isBefore(cutoffDate))
                .peek(moodRepository::delete)
                .count();

        Map<String, Object> result = new HashMap<>();
        result.put("waterDeleted", waterDeleted);
        result.put("exerciseDeleted", exerciseDeleted);
        result.put("sleepDeleted", sleepDeleted);
        result.put("caloriesDeleted", caloriesDeleted);
        result.put("moodDeleted", moodDeleted);
        result.put("totalDeleted", waterDeleted + exerciseDeleted + sleepDeleted + caloriesDeleted + moodDeleted);

        return ResponseEntity.ok(result);
    }

    // Get weekly report
    @GetMapping("/report/weekly")
    public Map<String, Object> getWeeklyReport() {
        Map<String, Object> report = new HashMap<>();
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        // Weekly Water Summary
        List<Object[]> waterWeekly = waterRepository.findAll().stream()
                .filter(log -> !log.getDate().isBefore(weekAgo))
                .collect(java.util.stream.Collectors.groupingBy(
                        log -> log.getDate(),
                        java.util.stream.Collectors.summingInt(log -> log.getAmount())))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // opsional: supaya urut
                .map(e -> new Object[] { e.getKey().toString(), e.getValue() })
                .collect(java.util.stream.Collectors.toList());

        report.put("weeklyWater", waterWeekly);

        // Similar for other metrics...
        report.put("dateRange", Map.of("from", weekAgo.toString(), "to", today.toString()));

        return report;
    }

    private String getOldestRecordDate() {
        List<LocalDate> dates = new ArrayList<>();

        waterRepository.findAll().stream()
                .map(log -> log.getDate())
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        exerciseRepository.findAll().stream()
                .map(log -> log.getDate())
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        sleepRepository.findAll().stream()
                .map(log -> log.getDate())
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        caloriesRepository.findAll().stream()
                .map(log -> log.getDate())
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        moodRepository.findAll().stream()
                .map(log -> log.getDate())
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        return dates.stream()
                .min(LocalDate::compareTo)
                .map(LocalDate::toString)
                .orElse(LocalDate.now().toString());
    }
}