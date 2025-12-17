package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fitlife.model.WaterLog;

@Repository
public interface WaterRepository extends JpaRepository<WaterLog, Long> {

    // =====================
    // DAILY / DASHBOARD
    // =====================
    List<WaterLog> findByUserIdAndDateOrderByTimeDesc(Long userId, LocalDate date);

    @Query("SELECT SUM(w.amount) FROM WaterLog w WHERE w.userId = :userId AND w.date = :date")
    Integer getTotalByDate(
        @Param("userId") Long userId,
        @Param("date") LocalDate date
    );

    // =====================
    // DATABASE CONTROLLER
    // =====================
    List<WaterLog> findByUserId(Long userId);

    long countByUserId(Long userId);

    long deleteByUserId(Long userId);

    long deleteByUserIdAndDateBefore(Long userId, LocalDate date);
}
