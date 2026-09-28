package com.renteasy.dto;

import com.renteasy.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementRequest {

    @NotNull(message = "Tenant ID is required")
    private Long tenantId;

    private LocalDate settlementDate;

    private Double damageDeductions;
    private Double cleaningDeductions;
    private Double otherDeductions;

    private PaymentMethod paymentMethod;

    @Size(max = 100)
    private String transactionReference;

    @Size(max = 500)
    private String notes;
}
