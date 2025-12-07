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

    public List<ExerciseLog> getRecentLogs() {
        return exerciseRepository.findTop20ByOrderByDateDescTimeDesc();
    }

    public ExerciseLog addExerciseLog(String type, Integer duration, Integer calories) {
        ExerciseLog log = new ExerciseLog(type, duration, calories,
                LocalDate.now(), LocalTime.now());
        return exerciseRepository.save(log);
    }

    public void deleteExerciseLog(Long id) {
        exerciseRepository.deleteById(id);
    }

    public Integer getTodayTotal() {
        Integer total = exerciseRepository.getTotalDurationByDate(LocalDate.now());
        return total != null ? total : 0;
    }

}
