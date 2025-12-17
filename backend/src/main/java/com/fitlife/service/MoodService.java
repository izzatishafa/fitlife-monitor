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

    public Optional<MoodLog> getTodayMood(Long userId) {
        return moodRepository.findByUserIdAndDate(
                userId, LocalDate.now());
    }

    public MoodLog saveMood(Long userId, Integer mood, String note) {
        Optional<MoodLog> existing = moodRepository.findByUserIdAndDate(userId, LocalDate.now());

        if (existing.isPresent()) {
            MoodLog log = existing.get();
            log.setMood(mood);
            log.setNote(note);
            return moodRepository.save(log);
        }

        MoodLog log = new MoodLog(
                userId,
                mood,
                note,
                LocalDate.now());
        return moodRepository.save(log);
    }

    public Double getAverageMood(Long userId) {
        Double avg = moodRepository.getAverageMood(userId);
        return avg != null ? avg : 0.0;
    }
}
