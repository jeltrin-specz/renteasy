package com.renteasy.dto;

import com.renteasy.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Rent Payment ID is required")
    private Long rentPaymentId;

    private Long tenantId; // Optional if derived from rentPayment

    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be greater than zero")
    private Double amount;

    private LocalDateTime paymentDate;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionReference;

    private String notes;
}
