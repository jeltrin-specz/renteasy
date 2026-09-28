package com.renteasy.dto;

import com.renteasy.entity.enums.RentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentPaymentRequest {

    @NotNull(message = "Tenant ID is required")
    private Long tenantId;

    private Long roomId;

    @NotBlank(message = "Billing month is required (e.g., 2026-09)")
    private String billingMonth;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Base rent is required")
    @Positive(message = "Base rent must be positive")
    private Double baseRent;

    private Double penaltyAmount;

    private RentStatus status;
}
