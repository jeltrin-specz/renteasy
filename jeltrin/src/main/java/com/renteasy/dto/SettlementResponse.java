package com.renteasy.dto;

import com.renteasy.entity.enums.PaymentMethod;
import com.renteasy.entity.enums.SettlementStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementResponse {

    private Long settlementId;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private Long roomId;
    private String roomNumber;
    private LocalDate settlementDate;
    private Double securityDeposit;
    private Double unpaidRentAmount;
    private Double unpaidPenaltyAmount;
    private Double damageDeductions;
    private Double cleaningDeductions;
    private Double otherDeductions;
    private Double totalDeductions;
    private Double netRefundAmount;
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private String notes;
    private SettlementStatus status;
    private LocalDateTime createdAt;
}
