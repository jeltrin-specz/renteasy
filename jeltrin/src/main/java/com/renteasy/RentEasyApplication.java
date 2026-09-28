package com.renteasy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RentEasyApplication {

    public static void main(String[] args) {
        SpringApplication.run(RentEasyApplication.class, args);
    }
}
