package com.fitlife;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FitLifeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FitLifeBackendApplication.class, args);
        System.out.println("🚀 FitLife Backend is running on http://localhost:8080");
        System.out.println("📊API Documentation: http://localhost:8080/api");
    }
}
