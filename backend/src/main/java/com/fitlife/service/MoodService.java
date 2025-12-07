package com.fitlife.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fitlife.model.MoodLog;
import com.fitlife.repository.MoodRepository;

@Service
public class MoodService {
    
    @Autowired
    private MoodRepository moodRepository;
    
    public Optional<MoodLog> getTodayMood() {
        return moodRepository.findByDate(LocalDate.now());
    }
    
    public MoodLog saveMood(Integer mood, String note) {
        Optional<MoodLog> existing = moodRepository.findByDate(LocalDate.now());
        
        if (existing.isPresent()) {
            MoodLog log = existing.get();
            log.setMood(mood);
            log.setNote(note);
            return moodRepository.save(log);
        } else {
            MoodLog log = new MoodLog(mood, note, LocalDate.now());
            return moodRepository.save(log);
        }
    }
    
    public Double getWeeklyAverage() {
        Double avg = moodRepository.getAverageMood();
        return avg != null ? avg : 0.0;
    }
}