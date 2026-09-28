package com.renteasy.dto;

import com.renteasy.entity.enums.RentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRentResponse {
    private Long rentPaymentId;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private Long roomId;
    private String roomNumber;
    private String billingMonth;
    private Double monthlyRent;
    private Double penalty;
    private Double totalDue;
    private Double amountPaid;
    private Double balance;
    private LocalDate dueDate;
    private RentStatus status;
    private Long daysOverdue;
}
