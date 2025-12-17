package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fitlife.model.CaloriesLog;

@Repository
public interface CaloriesRepository extends JpaRepository<CaloriesLog, Long> {

    // =====================
    // DAILY / DASHBOARD
    // =====================
    List<CaloriesLog> findByUserIdAndDateOrderByTimeDesc(Long userId, LocalDate date);

    @Query("""
        SELECT SUM(c.calories)
        FROM CaloriesLog c
        WHERE c.userId = :userId
          AND c.date = :date
    """)
    Integer getTotalByDate(
        @Param("userId") Long userId,
        @Param("date") LocalDate date
    );

    // =====================
    // DATABASE CONTROLLER
    // =====================
    List<CaloriesLog> findByUserId(Long userId);

    long countByUserId(Long userId);

    long deleteByUserId(Long userId);

    long deleteByUserIdAndDateBefore(Long userId, LocalDate date);
}
