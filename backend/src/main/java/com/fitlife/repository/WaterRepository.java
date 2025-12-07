package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fitlife.model.WaterLog;

@Repository
public interface WaterRepository extends JpaRepository<WaterLog, Long> {

    List<WaterLog> findByDateOrderByTimeDesc(LocalDate date);

    @Query("SELECT SUM(w.amount) FROM WaterLog w WHERE w.date = :date")
    Integer getTotalByDate(LocalDate date);
}