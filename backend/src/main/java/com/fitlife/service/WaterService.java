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

    public List<WaterLog> getTodayLogs() {
        return waterRepository.findByDateOrderByTimeDesc(LocalDate.now());
    }

    public WaterLog addWaterLog(Integer amount) {
        WaterLog log = new WaterLog(amount, LocalDate.now(), LocalTime.now());
        return waterRepository.save(log);
    }

    public void deleteWaterLog(Long id) {
        waterRepository.deleteById(id);
    }

    public Integer getTodayTotal() {
        Integer total = waterRepository.getTotalByDate(LocalDate.now());
        return total != null ? total : 0;
    }

}
