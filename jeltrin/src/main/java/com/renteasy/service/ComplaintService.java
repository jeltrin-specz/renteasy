package com.renteasy.service;

import com.renteasy.dto.ComplaintRequest;
import com.renteasy.dto.ComplaintResponse;
import com.renteasy.dto.ComplaintStatusUpdateRequest;
import com.renteasy.entity.Complaint;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.ComplaintCategory;
import com.renteasy.entity.enums.ComplaintPriority;
import com.renteasy.entity.enums.ComplaintStatus;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.ComplaintRepository;
import com.renteasy.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with ID: " + request.getTenantId()));

        Room room = tenant.getRoom();
        if (room == null) {
            throw new IllegalStateException("Tenant is not currently assigned to any room");
        }

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.OPEN)
                .tenant(tenant)
                .room(room)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        log.info("Created new complaint #{} for tenant {} in room {}", saved.getComplaintId(), tenant.getFullName(), room.getRoomNumber());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints(ComplaintStatus status, ComplaintCategory category, ComplaintPriority priority) {
        List<Complaint> complaints = complaintRepository.filterComplaints(status, category, priority);
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint ticket not found with ID: " + id));
        return mapToResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsByTenant(Long tenantId) {
        List<Complaint> complaints = complaintRepository.findByTenant_TenantIdOrderByCreatedAtDesc(tenantId);
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatusUpdateRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint ticket not found with ID: " + id));

        complaint.setStatus(request.getStatus());
        if (request.getAssignedTo() != null && !request.getAssignedTo().isBlank()) {
            complaint.setAssignedTo(request.getAssignedTo());
        }
        if (request.getAdminNotes() != null && !request.getAdminNotes().isBlank()) {
            complaint.setAdminNotes(request.getAdminNotes());
        }

        if (request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        Complaint updated = complaintRepository.save(complaint);
        log.info("Updated complaint #{} status to {}", updated.getComplaintId(), updated.getStatus());
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint ticket not found with ID: " + id));
        complaintRepository.delete(complaint);
        log.info("Deleted complaint ticket #{}", id);
    }

    public ComplaintResponse mapToResponse(Complaint complaint) {
        Tenant tenant = complaint.getTenant();
        Room room = complaint.getRoom();

        return ComplaintResponse.builder()
                .complaintId(complaint.getComplaintId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .tenantId(tenant != null ? tenant.getTenantId() : null)
                .tenantName(tenant != null ? tenant.getFullName() : "Unknown")
                .tenantPhone(tenant != null ? tenant.getPhone() : null)
                .roomId(room != null ? room.getRoomId() : null)
                .roomNumber(room != null ? room.getRoomNumber() : "N/A")
                .floor(room != null ? room.getFloor() : null)
                .assignedTo(complaint.getAssignedTo())
                .adminNotes(complaint.getAdminNotes())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .resolvedAt(complaint.getResolvedAt())
                .build();
    }
}
