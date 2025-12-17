package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fitlife.model.MoodLog;

@Repository
public interface MoodRepository extends JpaRepository<MoodLog, Long> {

    // =====================
    // DAILY / DASHBOARD
    // =====================
    Optional<MoodLog> findByUserIdAndDate(Long userId, LocalDate date);

    List<MoodLog> findTop7ByUserIdOrderByDateDesc(Long userId);

    @Query("""
                SELECT AVG(m.mood)
                FROM MoodLog m
                WHERE m.userId = :userId
            """)
    Double getAverageMood(@Param("userId") Long userId);

    // =====================
    // DATABASE CONTROLLER
    // =====================
    List<MoodLog> findByUserId(Long userId);

    long countByUserId(Long userId);

    long deleteByUserId(Long userId);

    long deleteByUserIdAndDateBefore(Long userId, LocalDate date);
}
