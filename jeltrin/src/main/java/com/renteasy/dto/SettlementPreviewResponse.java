package com.renteasy.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementPreviewResponse {

    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private String roomNumber;
    private Double securityDeposit;
    private Double unpaidRentAmount;
    private Double unpaidPenaltyAmount;
    private Double totalUnpaidDues;
    private Double estimatedRefund;
}
