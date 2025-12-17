package com.fitlife.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitlife.model.CaloriesLog;
import com.fitlife.repository.CaloriesRepository;

@Service
public class CaloriesService {

    @Autowired
    private CaloriesRepository caloriesRepository;

    public List<CaloriesLog> getTodayLogs(Long userId) {
        return caloriesRepository.findByUserIdAndDateOrderByTimeDesc(
                userId, LocalDate.now());
    }

    public CaloriesLog addCaloriesLog(
            Long userId,
            String foodName,
            Integer calories) {
        CaloriesLog log = new CaloriesLog(
                userId,
                foodName,
                calories,
                LocalDate.now(),
                LocalTime.now());
        return caloriesRepository.save(log);
    }

    public void deleteCaloriesLog(Long id) {
        caloriesRepository.deleteById(id);
    }

    public Integer getTodayTotal(Long userId) {
        Integer total = caloriesRepository.getTotalByDate(
                userId, LocalDate.now());
        return total != null ? total : 0;
    }
}
