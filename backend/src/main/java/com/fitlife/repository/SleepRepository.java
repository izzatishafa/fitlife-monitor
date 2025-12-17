package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fitlife.model.SleepLog;

@Repository
public interface SleepRepository extends JpaRepository<SleepLog, Long> {

    // =====================
    // DAILY / DASHBOARD
    // =====================
    List<SleepLog> findByUserIdAndDate(Long userId, LocalDate date);

    @Query("""
                SELECT AVG(s.hours)
                FROM SleepLog s
                WHERE s.userId = :userId
                  AND s.date = :date
            """)
    Double getAverageHours(
            @Param("userId") Long userId,
            @Param("date") LocalDate date);

    // =====================
    // DATABASE CONTROLLER
    // =====================
    List<SleepLog> findByUserId(Long userId);

    long countByUserId(Long userId);

    long deleteByUserId(Long userId);

    long deleteByUserIdAndDateBefore(Long userId, LocalDate date);
}
