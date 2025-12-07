package com.fitlife.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.model.MoodLog;
import com.fitlife.service.CaloriesService;
import com.fitlife.service.ExerciseService;
import com.fitlife.service.MoodService;
import com.fitlife.service.SleepService;
import com.fitlife.service.WaterService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

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

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("waterToday", waterService.getTodayTotal());
        stats.put("exerciseToday", exerciseService.getTodayTotal());
        stats.put("avgSleep", sleepService.getAverageHours());
        stats.put("caloriesToday", caloriesService.getTodayTotal());
        stats.put("moodToday", moodService.getTodayMood().map(MoodLog::getMood).orElse(0));
        stats.put("avgMood", moodService.getWeeklyAverage());
        return stats;
    }

    @GetMapping("/summary")
    public Map<String, Object> getDailySummary() {
        Map<String, Object> summary = new HashMap<>();
        LocalDate today = LocalDate.now();

        // Water Summary
        Integer waterToday = waterService.getTodayTotal();
        Map<String, Object> waterSummary = new HashMap<>();
        waterSummary.put("total", waterToday);
        waterSummary.put("goal", 2000);
        waterSummary.put("percentage", Math.min((waterToday * 100.0) / 2000, 100));
        waterSummary.put("status", waterToday >= 2000 ? "achieved" : "in_progress");
        summary.put("water", waterSummary);

        // Exercise Summary
        Integer exerciseToday = exerciseService.getTodayTotal();
        Map<String, Object> exerciseSummary = new HashMap<>();
        exerciseSummary.put("total", exerciseToday);
        exerciseSummary.put("goal", 30);
        exerciseSummary.put("percentage", Math.min((exerciseToday * 100.0) / 30, 100));
        exerciseSummary.put("status", exerciseToday >= 30 ? "achieved" : "in_progress");
        summary.put("exercise", exerciseSummary);

        // Sleep Summary (yesterday's sleep)
        Double avgSleep = sleepService.getAverageHours();
        Map<String, Object> sleepSummary = new HashMap<>();
        sleepSummary.put("average", avgSleep);
        sleepSummary.put("goal", 7.5);
        sleepSummary.put("status", avgSleep >= 7.0 && avgSleep <= 9.0 ? "optimal" : "needs_improvement");
        summary.put("sleep", sleepSummary);

        // Calories Summary
        Integer caloriesToday = caloriesService.getTodayTotal();
        Map<String, Object> caloriesSummary = new HashMap<>();
        caloriesSummary.put("total", caloriesToday);
        caloriesSummary.put("goal", 2000);
        caloriesSummary.put("percentage", Math.min((caloriesToday * 100.0) / 2000, 100));
        caloriesSummary.put("status", caloriesToday <= 2000 ? "good" : "exceeded");
        summary.put("calories", caloriesSummary);

        // Mood Summary
        Optional<MoodLog> todayMood = moodService.getTodayMood();
        Map<String, Object> moodSummary = new HashMap<>();
        if (todayMood.isPresent()) {
            moodSummary.put("mood", todayMood.get().getMood());
            moodSummary.put("note", todayMood.get().getNote());
            moodSummary.put("logged", true);
        } else {
            moodSummary.put("logged", false);
        }
        summary.put("mood", moodSummary);

        // Overall Health Score (0-100)
        int score = calculateHealthScore(waterToday, exerciseToday, avgSleep, caloriesToday,
                todayMood.map(MoodLog::getMood).orElse(3));
        summary.put("healthScore", score);

        // Recommendations
        summary.put("recommendations", generateRecommendations(waterToday, exerciseToday, avgSleep, caloriesToday));

        return summary;
    }

    private int calculateHealthScore(Integer water, Integer exercise, Double sleep, Integer calories, Integer mood) {
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
            recommendations.add("💧 Drink more water! You're " + (2000 - water) + "ml away from your goal.");
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
}