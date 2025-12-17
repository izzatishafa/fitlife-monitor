package com.fitlife.controller;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.model.CaloriesLog;
import com.fitlife.model.ExerciseLog;
import com.fitlife.model.MoodLog;
import com.fitlife.model.SleepLog;
import com.fitlife.model.WaterLog;
import com.fitlife.repository.CaloriesRepository;
import com.fitlife.repository.ExerciseRepository;
import com.fitlife.repository.MoodRepository;
import com.fitlife.repository.SleepRepository;
import com.fitlife.repository.WaterRepository;
import com.fitlife.service.CaloriesService;
import com.fitlife.service.ExerciseService;
import com.fitlife.service.MoodService;
import com.fitlife.service.SleepService;
import com.fitlife.service.WaterService;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

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

    // Services for PDF generation
    @Autowired
    private WaterService waterService;
    @Autowired
    private ExerciseService exerciseService;
    @Autowired
    private SleepService sleepService;
    @Autowired
    private CaloriesService caloriesService;
    @Autowired
    private MoodService moodService;

    // Get database statistics
    @GetMapping("/stats")
    public Map<String, Object> getDatabaseStats(@RequestParam Long userId) {
        Map<String, Object> stats = new HashMap<>();

        long water = waterRepository.countByUserId(userId);
        long exercise = exerciseRepository.countByUserId(userId);
        long sleep = sleepRepository.countByUserId(userId);
        long calories = caloriesRepository.countByUserId(userId);
        long mood = moodRepository.countByUserId(userId);

        stats.put("waterLogs", water);
        stats.put("exerciseLogs", exercise);
        stats.put("sleepLogs", sleep);
        stats.put("caloriesLogs", calories);
        stats.put("moodLogs", mood);
        stats.put("totalRecords", water + exercise + sleep + calories + mood);

        stats.put("oldestRecord", getOldestRecordDate(userId));
        stats.put("newestRecord", LocalDate.now().toString());

        return stats;
    }

    // Export dashboard as PDF
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportDashboardToPdf(@RequestParam Long userId) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Fonts
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 40, Font.BOLD, BaseColor.DARK_GRAY);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.BLACK);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.BLACK);
            Font boldFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.BLACK);

            // Title
            Paragraph title = new Paragraph("FitLife Health Dashboard Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // Date
            LocalDate today = LocalDate.now();
            Paragraph date = new Paragraph(
                    "Generated: " + today.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")),
                    normalFont);
            date.setAlignment(Element.ALIGN_CENTER);
            date.setSpacingAfter(20);
            document.add(date);

            // Get data
            Integer waterToday = waterService.getTodayTotal(userId);
            Integer exerciseToday = exerciseService.getTodayTotal(userId);
            Double avgSleep = sleepService.getAverageHours(userId);
            Integer caloriesToday = caloriesService.getTodayTotal(userId);
            Optional<MoodLog> todayMood = moodService.getTodayMood(userId);
            int healthScore = calculateHealthScore(waterToday, exerciseToday, avgSleep, caloriesToday,
                    todayMood.map(MoodLog::getMood).orElse(3));

            // Health Score Section
            Paragraph scoreHeader = new Paragraph("Overall Health Score", headerFont);
            scoreHeader.setSpacingAfter(10);
            document.add(scoreHeader);

            Paragraph scoreValue = new Paragraph(healthScore + " / 100", titleFont);
            scoreValue.setAlignment(Element.ALIGN_CENTER);
            scoreValue.setSpacingAfter(20);
            document.add(scoreValue);

            // Daily Metrics Table
            Paragraph metricsHeader = new Paragraph("Daily Metrics", headerFont);
            metricsHeader.setSpacingAfter(10);
            document.add(metricsHeader);

            PdfPTable metricsTable = new PdfPTable(4);
            metricsTable.setWidthPercentage(100);
            metricsTable.setSpacingAfter(20);

            // Header row
            addTableHeader(metricsTable, "Metric", boldFont);
            addTableHeader(metricsTable, "Current", boldFont);
            addTableHeader(metricsTable, "Goal", boldFont);
            addTableHeader(metricsTable, "Status", boldFont);

            // Water row
            addTableCell(metricsTable, "Water Intake", normalFont);
            addTableCell(metricsTable, waterToday + " ml", normalFont);
            addTableCell(metricsTable, "2000 ml", normalFont);
            addTableCell(metricsTable, waterToday >= 2000 ? "Achieved" : "In Progress", normalFont);

            // Exercise row
            addTableCell(metricsTable, "Exercise", normalFont);
            addTableCell(metricsTable, exerciseToday + " min", normalFont);
            addTableCell(metricsTable, "30 min", normalFont);
            addTableCell(metricsTable, exerciseToday >= 30 ? "Achieved" : "In Progress", normalFont);

            // Sleep row
            addTableCell(metricsTable, "Sleep (Avg)", normalFont);
            addTableCell(metricsTable, String.format("%.1f hrs", avgSleep), normalFont);
            addTableCell(metricsTable, "7-9 hrs", normalFont);
            addTableCell(metricsTable, avgSleep >= 7.0 && avgSleep <= 9.0 ? "Optimal" : "Needs Improvement",
                    normalFont);

            // Calories row
            addTableCell(metricsTable, "Calories", normalFont);
            addTableCell(metricsTable, caloriesToday + " kcal", normalFont);
            addTableCell(metricsTable, "2000 kcal", normalFont);
            addTableCell(metricsTable, caloriesToday <= 2000 ? "Good" : "Exceeded", normalFont);

            document.add(metricsTable);

            // Mood Section
            Paragraph moodHeader = new Paragraph("Today's Mood", headerFont);
            moodHeader.setSpacingAfter(10);
            document.add(moodHeader);

            if (todayMood.isPresent()) {
                String moodText = getMoodEmoji(todayMood.get().getMood()) + " "
                        + getMoodLabel(todayMood.get().getMood());
                Paragraph mood = new Paragraph(moodText, normalFont);
                mood.setSpacingAfter(5);
                document.add(mood);

                if (todayMood.get().getNote() != null && !todayMood.get().getNote().isEmpty()) {
                    Paragraph note = new Paragraph("Note: " + todayMood.get().getNote(), normalFont);
                    note.setSpacingAfter(15);
                    document.add(note);
                }
            } else {
                Paragraph noMood = new Paragraph("No mood logged today", normalFont);
                noMood.setSpacingAfter(15);
                document.add(noMood);
            }

            // Recommendations Section
            Paragraph recHeader = new Paragraph("Recommendations", headerFont);
            recHeader.setSpacingAfter(10);
            document.add(recHeader);

            List<String> recommendations = generateRecommendations(waterToday, exerciseToday, avgSleep,
                    caloriesToday);
            for (String rec : recommendations) {
                Paragraph recItem = new Paragraph("• " + rec, normalFont);
                recItem.setSpacingAfter(5);
                document.add(recItem);
            }

            document.close();

            byte[] pdfBytes = out.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "fitlife-report-" + today + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Export all data as CSV
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCSV(@RequestParam Long userId) {
        StringBuilder csv = new StringBuilder();
        csv.append("Type,Date,Time,Value1,Value2,Value3,Note\n");

        waterRepository.findByUserId(userId).forEach(log -> {
            csv.append(String.format("Water,%s,%s,%d,,,\n",
                    log.getDate(), log.getTime(), log.getAmount()));
        });

        exerciseRepository.findByUserId(userId).forEach(log -> {
            csv.append(String.format("Exercise,%s,%s,%s,%d,%d,\n",
                    log.getDate(), log.getTime(), log.getType(),
                    log.getDuration(), log.getCalories()));
        });

        sleepRepository.findByUserId(userId).forEach(log -> {
            csv.append(String.format("Sleep,%s,,%.1f,%d,,\n",
                    log.getDate(), log.getHours(), log.getQuality()));
        });

        caloriesRepository.findByUserId(userId).forEach(log -> {
            csv.append(String.format("Calories,%s,%s,%d,,,%s\n",
                    log.getDate(), log.getTime(), log.getCalories(),
                    log.getFoodName() != null ? log.getFoodName() : ""));
        });

        moodRepository.findByUserId(userId).forEach(log -> {
            csv.append(String.format("Mood,%s,,%d,,,%s\n",
                    log.getDate(), log.getMood(),
                    log.getNote() != null ? log.getNote() : ""));
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData(
                "attachment", "fitlife_data_" + userId + ".csv");

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(csv.toString());

    }

    // Export all data as JSON
    @GetMapping("/export/json")
    public Map<String, Object> exportToJSON(@RequestParam Long userId) {
        Map<String, Object> data = new HashMap<>();

        data.put("exportDate", LocalDate.now().toString());
        data.put("water", waterRepository.findByUserId(userId));
        data.put("exercise", exerciseRepository.findByUserId(userId));
        data.put("sleep", sleepRepository.findByUserId(userId));
        data.put("calories", caloriesRepository.findByUserId(userId));
        data.put("mood", moodRepository.findByUserId(userId));

        return data;
    }

    // Delete all data (with confirmation)

    @DeleteMapping("/clear-all")
    @Transactional
    public ResponseEntity<Map<String, String>> clearAllData(
            @RequestParam Long userId,
            @RequestParam String confirmation) {

        if (!"DELETE_ALL_DATA".equals(confirmation)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid confirmation code"));
        }

        // ⚠️ urutan aman
        moodRepository.deleteByUserId(userId);
        sleepRepository.deleteByUserId(userId);
        exerciseRepository.deleteByUserId(userId);
        caloriesRepository.deleteByUserId(userId);
        waterRepository.deleteByUserId(userId);

        return ResponseEntity.ok(
                Map.of("message", "All user data deleted successfully"));
    }

    // Delete old data (older than X days)
    @DeleteMapping("/cleanup")
    @Transactional
    public ResponseEntity<Map<String, Object>> cleanupOldData(
            @RequestParam Long userId,
            @RequestParam int olderThanDays) {

        LocalDate cutoffDate = LocalDate.now().minusDays(olderThanDays);

        long waterDeleted = waterRepository.deleteByUserIdAndDateBefore(userId, cutoffDate);
        long exerciseDeleted = exerciseRepository.deleteByUserIdAndDateBefore(userId, cutoffDate);
        long sleepDeleted = sleepRepository.deleteByUserIdAndDateBefore(userId, cutoffDate);
        long caloriesDeleted = caloriesRepository.deleteByUserIdAndDateBefore(userId, cutoffDate);
        long moodDeleted = moodRepository.deleteByUserIdAndDateBefore(userId, cutoffDate);

        long totalDeleted = waterDeleted +
                exerciseDeleted +
                sleepDeleted +
                caloriesDeleted +
                moodDeleted;

        return ResponseEntity.ok(Map.of(
                "totalDeleted", totalDeleted,
                "waterDeleted", waterDeleted,
                "exerciseDeleted", exerciseDeleted,
                "sleepDeleted", sleepDeleted,
                "caloriesDeleted", caloriesDeleted,
                "moodDeleted", moodDeleted));
    }

    // Get weekly report
    @GetMapping("/report/weekly")
    public Map<String, Object> getWeeklyReport(@RequestParam Long userId) {
        Map<String, Object> report = new HashMap<>();
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        Map<LocalDate, Integer> waterByDate = waterRepository.findByUserId(userId).stream()
                .filter(log -> !log.getDate().isBefore(weekAgo))
                .collect(Collectors.groupingBy(
                        WaterLog::getDate,
                        Collectors.summingInt(WaterLog::getAmount)));

        report.put("weeklyWater", mapToList(waterByDate));

        Map<LocalDate, Integer> exerciseByDate = exerciseRepository.findByUserId(userId).stream()
                .filter(log -> !log.getDate().isBefore(weekAgo))
                .collect(Collectors.groupingBy(
                        ExerciseLog::getDate,
                        Collectors.summingInt(ExerciseLog::getDuration)));

        report.put("weeklyExercise", mapToList(exerciseByDate));

        Map<LocalDate, Integer> caloriesByDate = caloriesRepository.findByUserId(userId).stream()
                .filter(log -> !log.getDate().isBefore(weekAgo))
                .collect(Collectors.groupingBy(
                        CaloriesLog::getDate,
                        Collectors.summingInt(CaloriesLog::getCalories)));

        report.put("weeklyCalories", mapToList(caloriesByDate));
        report.put("dateRange", Map.of("from", weekAgo, "to", today));

        return report;
    }

    // Helper methods
    private List<Map<String, Object>> mapToList(Map<LocalDate, Integer> data) {
        return data.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", e.getKey().toString());
                    map.put("total", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private String getMoodEmoji(int mood) {
        switch (mood) {
            case 1:
                return "😢";
            case 2:
                return "😕";
            case 3:
                return "😐";
            case 4:
                return "😊";
            case 5:
                return "😄";
            default:
                return "😐";
        }
    }

    private String getMoodLabel(int mood) {
        switch (mood) {
            case 1:
                return "Very Bad";
            case 2:
                return "Bad";
            case 3:
                return "Neutral";
            case 4:
                return "Good";
            case 5:
                return "Excellent";
            default:
                return "Neutral";
        }
    }

    private int calculateHealthScore(Integer water, Integer exercise, Double sleep, Integer calories,
            Integer mood) {
        int score = 0;

        // Water score (0-20)
        score += Math.min((water * 20) / 2000, 20);

        // Exercise score (0-20)
        score += Math.min((exercise * 20) / 30, 20);

        // Sleep score (0-20)
        if (sleep >= 7.0 && sleep <= 9.0)
            score += 20;
        else if (sleep >= 6.0 && sleep <= 10.0)
            score += 15;
        else
            score += 5;

        // Calories score (0-20)
        if (calories >= 1500 && calories <= 2500)
            score += 20;
        else if (calories >= 1200 && calories <= 3000)
            score += 15;
        else
            score += 5;

        // Mood score (0-20)
        score += (mood * 4);

        return score;
    }

    private List<String> generateRecommendations(Integer water, Integer exercise, Double sleep, Integer calories) {
        List<String> recommendations = new ArrayList<>();

        if (water < 2000) {
            recommendations.add(
                    "💧 Drink more water! You're " + (2000 - water) + "ml away from your goal.");
        }
        if (exercise < 30) {
            recommendations.add("🏃 Try to get at least 30 minutes of exercise today.");
        }
        if (sleep < 7.0) {
            recommendations.add("🌙 Aim for 7-9 hours of sleep tonight for better health.");
        }
        if (calories > 2500) {
            recommendations.add("🍽️ You've exceeded your calorie limit. Consider lighter meals.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("🎉 Great job! You're on track with all your health goals today!");
        }

        return recommendations;
    }

    private String getOldestRecordDate(Long userId) {
        List<LocalDate> dates = new ArrayList<>();

        waterRepository.findByUserId(userId).stream()
                .map(WaterLog::getDate)
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        exerciseRepository.findByUserId(userId).stream()
                .map(ExerciseLog::getDate)
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        sleepRepository.findByUserId(userId).stream()
                .map(SleepLog::getDate)
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        caloriesRepository.findByUserId(userId).stream()
                .map(CaloriesLog::getDate)
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        moodRepository.findByUserId(userId).stream()
                .map(MoodLog::getDate)
                .min(LocalDate::compareTo)
                .ifPresent(dates::add);

        return dates.stream()
                .min(LocalDate::compareTo)
                .map(LocalDate::toString)
                .orElse(LocalDate.now().toString());
    }
}