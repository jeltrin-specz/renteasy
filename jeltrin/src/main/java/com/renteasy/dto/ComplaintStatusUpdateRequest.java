package com.renteasy.dto;

import com.renteasy.entity.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    @Size(max = 100, message = "Assigned staff name cannot exceed 100 characters")
    private String assignedTo;

    @Size(max = 500, message = "Admin notes cannot exceed 500 characters")
    private String adminNotes;
}
