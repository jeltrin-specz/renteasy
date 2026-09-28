package com.renteasy.dto;

import com.renteasy.entity.enums.PaymentMethod;
import com.renteasy.entity.enums.RentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private Long rentPaymentId;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private Long roomId;
    private String roomNumber;
    private String billingMonth;
    private Double amount;
    private LocalDateTime paymentDate;
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private String notes;
    private Double updatedBalance;
    private RentStatus updatedRentStatus;
    private LocalDateTime createdAt;
}
