package com.renteasy.dto;

import com.renteasy.entity.enums.RentStatus;
import com.renteasy.entity.enums.TenantStatus;
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
public class TenantResponse {
    private Long tenantId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String gender;
    private LocalDate dateOfBirth;
    private String idProofType;
    private String idProofNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private Double monthlyRent;
    private Double securityDeposit;
    private TenantStatus status;

    // Room Details
    private Long roomId;
    private String roomNumber;
    private Integer floor;
    private String roomType;

    // Financial calculations
    private Double totalExpectedRent;
    private Double totalAmountPaid;
    private Double totalOutstandingDues;
    private Double totalPenalties;
    private RentStatus currentMonthStatus;
    private Integer unpaidMonthsCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
