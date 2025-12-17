package com.fitlife.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitlife.model.ExerciseLog;
import com.fitlife.repository.ExerciseRepository;

@Service
public class ExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    public List<ExerciseLog> getRecentLogs(Long userId) {
        return exerciseRepository.findByUserIdAndDateOrderByTimeDesc(
                userId, LocalDate.now());
    }

    public ExerciseLog addExerciseLog(
            Long userId,
            String type,
            Integer duration,
            Integer calories) {
        ExerciseLog log = new ExerciseLog(
                userId,
                type,
                duration,
                calories,
                LocalDate.now(),
                LocalTime.now());
        return exerciseRepository.save(log);
    }

    public void deleteExerciseLog(Long id) {
        exerciseRepository.deleteById(id);
    }

    public Integer getTodayTotal(Long userId) {
        Integer total = exerciseRepository.getTotalDurationByDate(
                userId, LocalDate.now());
        return total != null ? total : 0;
    }
}
