package com.renteasy.controller;

import com.renteasy.dto.ComplaintRequest;
import com.renteasy.dto.ComplaintResponse;
import com.renteasy.dto.ComplaintStatusUpdateRequest;
import com.renteasy.entity.enums.ComplaintCategory;
import com.renteasy.entity.enums.ComplaintPriority;
import com.renteasy.entity.enums.ComplaintStatus;
import com.renteasy.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Maintenance Complaints", description = "Tenant maintenance and complaint ticket management APIs")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @Operation(summary = "Raise a new maintenance complaint ticket")
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        ComplaintResponse created = complaintService.createComplaint(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all complaints with optional filtering by status, category, or priority")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) ComplaintPriority priority
    ) {
        List<ComplaintResponse> list = complaintService.getAllComplaints(status, category, priority);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint ticket details by ID")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        ComplaintResponse response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get all complaints submitted by a specific tenant")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByTenant(@PathVariable Long tenantId) {
        List<ComplaintResponse> list = complaintService.getComplaintsByTenant(tenantId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update complaint ticket status, assigned technician, and admin notes")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdateRequest request
    ) {
        ComplaintResponse updated = complaintService.updateComplaintStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a complaint ticket")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.noContent().build();
    }
}
