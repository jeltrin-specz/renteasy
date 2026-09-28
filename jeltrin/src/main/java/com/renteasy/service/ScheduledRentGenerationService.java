package com.renteasy.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledRentGenerationService {

    private final RentPaymentService rentPaymentService;

    /**
     * Runs daily at midnight to generate missing current-month rent obligations for active tenants.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleDailyRentCheck() {
        log.info("Running scheduled daily rent generation check...");
        int created = rentPaymentService.generateCurrentMonthRentForAllActiveTenants();
        log.info("Scheduled rent generation completed. Created {} new obligations.", created);
    }
}
