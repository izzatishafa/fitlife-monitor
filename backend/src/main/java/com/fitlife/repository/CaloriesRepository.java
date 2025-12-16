package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fitlife.model.CaloriesLog;

@Repository
public interface CaloriesRepository extends JpaRepository<CaloriesLog, Long> {
    
    List<CaloriesLog> findByDateOrderByTimeDesc(LocalDate date);
    long deleteByDateBefore(LocalDate date);
    
    @Query("SELECT SUM(c.calories) FROM CaloriesLog c WHERE c.date = :date")
    Integer getTotalByDate(LocalDate date);
}