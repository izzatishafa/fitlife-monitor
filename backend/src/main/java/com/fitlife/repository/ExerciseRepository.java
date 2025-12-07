package com.fitlife.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fitlife.model.ExerciseLog;

@Repository
public interface ExerciseRepository extends JpaRepository<ExerciseLog, Long> {

    List<ExerciseLog> findByDateOrderByTimeDesc(LocalDate date);

    List<ExerciseLog> findTop20ByOrderByDateDescTimeDesc();

    @Query("SELECT SUM(e.duration) FROM ExerciseLog e WHERE e.date = :date")
    Integer getTotalDurationByDate(LocalDate date);
}