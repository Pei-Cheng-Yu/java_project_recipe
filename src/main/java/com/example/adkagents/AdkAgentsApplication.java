package com.example.adkagents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AdkAgentsApplication {
    public static void main(String[] args) {
        System.out.println("JWT_SECRET = " + System.getenv("JWT_SECRET"));
        System.out.println("ENV FRONTEND: " + System.getenv("FRONTEND"));
        SpringApplication.run(AdkAgentsApplication.class, args);
       
    }
}
