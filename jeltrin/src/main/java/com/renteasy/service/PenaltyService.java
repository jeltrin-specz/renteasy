package com.renteasy.service;

import com.renteasy.entity.RentPayment;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.repository.RentPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PenaltyService {

    private final RentPaymentRepository rentPaymentRepository;

    @Value("${renteasy.penalty.daily-rate:100.0}")
    private Double dailyPenaltyRate;

    @Value("${renteasy.penalty.grace-period-days:0}")
    private Integer gracePeriodDays;

    /**
     * Determines whether a rent obligation is overdue.
     */
    public boolean isOverdue(RentPayment rentPayment, LocalDate referenceDate) {
        if (rentPayment.getStatus() == RentStatus.PAID) {
            return false;
        }
        if (rentPayment.getBalanceAmount() <= 0) {
            return false;
        }
        return referenceDate.isAfter(rentPayment.getDueDate().plusDays(gracePeriodDays));
    }

    /**
     * Calculates overdue days relative to a reference date (usually today).
     */
    public long calculateOverdueDays(RentPayment rentPayment, LocalDate referenceDate) {
        if (!isOverdue(rentPayment, referenceDate)) {
            return 0L;
        }
        LocalDate overdueStartDate = rentPayment.getDueDate().plusDays(gracePeriodDays);
        return Math.max(0L, ChronoUnit.DAYS.between(overdueStartDate, referenceDate));
    }

    /**
     * Calculates and updates penalty idempotently.
     * Prevents duplicate accumulation on repeat calls or refreshes.
     */
    @Transactional
    public RentPayment calculateAndUpdatePenalty(RentPayment rentPayment, LocalDate referenceDate) {
        if (rentPayment.getStatus() == RentStatus.PAID || rentPayment.getBalanceAmount() <= 0) {
            return rentPayment;
        }

        long overdueDays = calculateOverdueDays(rentPayment, referenceDate);
        if (overdueDays > 0) {
            double newPenalty = Math.round(overdueDays * dailyPenaltyRate * 100.0) / 100.0;
            
            // Set penalty idempotently
            rentPayment.setPenaltyAmount(newPenalty);
            rentPayment.setTotalDue(rentPayment.getBaseRent() + newPenalty);
            rentPayment.setBalanceAmount(Math.max(0.0, rentPayment.getTotalDue() - rentPayment.getAmountPaid()));
            rentPayment.setStatus(RentStatus.OVERDUE);
            return rentPaymentRepository.save(rentPayment);
        } else {
            // Not overdue
            if (rentPayment.getAmountPaid() > 0 && rentPayment.getBalanceAmount() > 0) {
                rentPayment.setStatus(RentStatus.PARTIALLY_PAID);
            } else if (rentPayment.getAmountPaid() == 0) {
                rentPayment.setStatus(RentStatus.PENDING);
            }
            return rentPayment;
        }
    }
}
