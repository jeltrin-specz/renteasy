package com.renteasy.dto;

import com.renteasy.entity.enums.ComplaintCategory;
import com.renteasy.entity.enums.ComplaintPriority;
import com.renteasy.entity.enums.ComplaintStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private Long complaintId;
    private String title;
    private String description;
    private ComplaintCategory category;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private Long tenantId;
    private String tenantName;
    private String tenantPhone;
    private Long roomId;
    private String roomNumber;
    private Integer floor;
    private String assignedTo;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
