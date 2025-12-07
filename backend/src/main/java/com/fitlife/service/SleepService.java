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

    public List<SleepLog> getRecentLogs() {
        return sleepRepository.findTop7ByOrderByDateDesc();
    }

    public SleepLog addSleepLog(Double hours, Integer quality) {
        SleepLog log = new SleepLog(hours, quality, LocalDate.now());
        return sleepRepository.save(log);
    }

    public void deleteSleepLog(Long id) {
        sleepRepository.deleteById(id);
    }

    public Double getAverageHours() {
        Double avg = sleepRepository.getAverageHours();
        return avg != null ? avg : 0.0;
    }

}
