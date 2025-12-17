package com.fitlife.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitlife.model.WaterLog;
import com.fitlife.repository.WaterRepository;

@Service
public class WaterService {
    @Autowired
    private WaterRepository waterRepository;

    // ✨ ADD userId parameter
    public List<WaterLog> getTodayLogs(Long userId) {
        return waterRepository.findByUserIdAndDateOrderByTimeDesc(userId, LocalDate.now());
    }

    // ✨ ADD userId parameter
    public WaterLog addWaterLog(Long userId, Integer amount) {
        WaterLog log = new WaterLog(userId, amount, LocalDate.now(), LocalTime.now());
        return waterRepository.save(log);
    }

    public void deleteWaterLog(Long id) {
        waterRepository.deleteById(id);
    }

    // ✨ ADD userId parameter
    public Integer getTodayTotal(Long userId) {
        Integer total = waterRepository.getTotalByDate(userId, LocalDate.now());
        return total != null ? total : 0;
    }
}