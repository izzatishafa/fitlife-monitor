package com.fitlife.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitlife.model.SleepLog;
import com.fitlife.repository.SleepRepository;

@Service
public class SleepService {

    @Autowired
    private SleepRepository sleepRepository;

    // ✨ userId + today
    public List<SleepLog> getRecentLogs(Long userId) {
        return sleepRepository.findByUserIdAndDate(
                userId, LocalDate.now());
    }

    // ✨ simpan userId
    public SleepLog addSleepLog(Long userId, Double hours, Integer quality) {
        SleepLog log = new SleepLog(
                userId,
                hours,
                quality,
                LocalDate.now());
        return sleepRepository.save(log);
    }

    public void deleteSleepLog(Long id) {
        sleepRepository.deleteById(id);
    }

    // ✨ average per user
    public Double getAverageHours(Long userId) {
        Double avg = sleepRepository.getAverageHours(userId, LocalDate.now());
        return avg != null ? avg : 0.0;
    }
}
