package com.renteasy.dto;

import com.renteasy.entity.enums.TenantStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Phone number must be valid")
    private String phone;

    @Email(message = "Email must be valid")
    private String email;

    private String address;

    private String gender;

    private LocalDate dateOfBirth;

    private String idProofType;

    private String idProofNumber;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @NotNull(message = "Move-in date is required")
    private LocalDate moveInDate;

    private LocalDate moveOutDate;

    @NotNull(message = "Monthly rent is required")
    @Positive(message = "Monthly rent must be positive")
    private Double monthlyRent;

    @Min(value = 0, message = "Security deposit cannot be negative")
    private Double securityDeposit;

    private TenantStatus status;

    private Long roomId; // ID of the room to assign (optional initially, but required for room assignment)
}
