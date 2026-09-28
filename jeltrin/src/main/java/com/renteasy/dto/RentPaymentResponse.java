package com.renteasy.dto;

import com.renteasy.entity.enums.RentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentPaymentResponse {
    private Long rentPaymentId;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private Long roomId;
    private String roomNumber;
    private String billingMonth;
    private LocalDate dueDate;
    private Double baseRent;
    private Double penaltyAmount;
    private Double totalDue;
    private Double amountPaid;
    private Double balanceAmount;
    private RentStatus status;
    private Long daysOverdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
