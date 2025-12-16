package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fitlife.model.SleepLog;

@Repository
public interface SleepRepository extends JpaRepository<SleepLog, Long> {

    List<SleepLog> findTop7ByOrderByDateDesc();
    long deleteByDateBefore(LocalDate date);

    @Query("SELECT AVG(s.hours) FROM SleepLog s")
    Double getAverageHours();
}