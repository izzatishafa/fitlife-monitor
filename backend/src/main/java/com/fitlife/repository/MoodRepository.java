package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fitlife.model.MoodLog;

@Repository
public interface MoodRepository extends JpaRepository<MoodLog, Long> {
    
    Optional<MoodLog> findByDate(LocalDate date);
    
    List<MoodLog> findTop7ByOrderByDateDesc();
    
    @Query("SELECT AVG(m.mood) FROM MoodLog m")
    Double getAverageMood();
}