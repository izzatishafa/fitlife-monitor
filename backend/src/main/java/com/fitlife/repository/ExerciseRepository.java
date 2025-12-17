package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fitlife.model.ExerciseLog;

@Repository
public interface ExerciseRepository extends JpaRepository<ExerciseLog, Long> {

    // =====================
    // DAILY / DASHBOARD
    // =====================
    List<ExerciseLog> findByUserIdAndDateOrderByTimeDesc(Long userId, LocalDate date);

    List<ExerciseLog> findTop20ByUserIdOrderByDateDescTimeDesc(Long userId);

    @Query("""
        SELECT SUM(e.duration)
        FROM ExerciseLog e
        WHERE e.userId = :userId
          AND e.date = :date
    """)
    Integer getTotalDurationByDate(
        @Param("userId") Long userId,
        @Param("date") LocalDate date
    );

    // =====================
    // DATABASE CONTROLLER
    // =====================
    List<ExerciseLog> findByUserId(Long userId);

    long countByUserId(Long userId);

    long deleteByUserId(Long userId);

    long deleteByUserIdAndDateBefore(Long userId, LocalDate date);
}
