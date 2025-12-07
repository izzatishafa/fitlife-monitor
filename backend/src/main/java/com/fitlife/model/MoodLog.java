package com.fitlife.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mood_logs")
public class MoodLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer mood; // 1-5 (😢😟😐🙂😁)
    
    @Column
    private String note;
    
    @Column(nullable = false)
    private LocalDate date;
    
    // Constructors
    public MoodLog() {}
    
    public MoodLog(Integer mood, String note, LocalDate date) {
        this.mood = mood;
        this.note = note;
        this.date = date;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getMood() { return mood; }
    public void setMood(Integer mood) { this.mood = mood; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}