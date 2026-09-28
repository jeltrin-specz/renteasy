package com.renteasy.dto;

import com.renteasy.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptResponse {
    private String receiptNumber;
    private Long paymentId;
    private Long rentPaymentId;
    private String tenantName;
    private String tenantPhone;
    private String tenantEmail;
    private String roomNumber;
    private Integer floor;
    private String billingMonth;
    private Double baseRent;
    private Double penaltyAmount;
    private Double totalDue;
    private Double paymentAmount;
    private Double totalAmountPaid;
    private Double remainingBalance;
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private LocalDateTime paymentDate;
    private String notes;
    private String status;
}
