package com.renteasy.controller;

import com.renteasy.dto.PendingRentResponse;
import com.renteasy.dto.RentPaymentRequest;
import com.renteasy.dto.RentPaymentResponse;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.service.RentPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rent-payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "03 Rent Payments", description = "Endpoints for monthly rent obligations, pending dues, overdue status, and penalty calculations")
public class RentPaymentController {

    private final RentPaymentService rentPaymentService;

    @GetMapping
    @Operation(summary = "Get all monthly rent obligations with optional filters by billingMonth (YYYY-MM) and status")
    public ResponseEntity<List<RentPaymentResponse>> getAllRentPayments(
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) RentStatus status) {
        return ResponseEntity.ok(rentPaymentService.getAllRentPayments(billingMonth, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rent obligation by ID with updated penalty and balance")
    public ResponseEntity<RentPaymentResponse> getRentPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(rentPaymentService.getRentPaymentById(id));
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get all monthly rent obligations for a specific tenant")
    public ResponseEntity<List<RentPaymentResponse>> getRentPaymentsByTenant(@PathVariable Long tenantId) {
        return ResponseEntity.ok(rentPaymentService.getRentPaymentsByTenant(tenantId));
    }

    @GetMapping("/pending/current-month")
    @Operation(summary = "Get list of tenants who have NOT fully paid the current month's rent")
    public ResponseEntity<List<PendingRentResponse>> getCurrentMonthPending() {
        return ResponseEntity.ok(rentPaymentService.getCurrentMonthPending());
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get all overdue rent obligations with calculated daily penalties")
    public ResponseEntity<List<PendingRentResponse>> getOverdueRentPayments() {
        return ResponseEntity.ok(rentPaymentService.getAllOverdue());
    }

    @GetMapping("/pending")
    @Operation(summary = "Get all pending and partially paid rent obligations")
    public ResponseEntity<List<PendingRentResponse>> getPendingRentPayments() {
        return ResponseEntity.ok(rentPaymentService.getAllPending());
    }

    @PostMapping
    @Operation(summary = "Create a monthly rent obligation record manually")
    public ResponseEntity<RentPaymentResponse> createRentPayment(@Valid @RequestBody RentPaymentRequest request) {
        RentPaymentResponse created = rentPaymentService.createRentPayment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/generate-current-month")
    @Operation(summary = "Generate current month rent obligations for all active tenants if missing")
    public ResponseEntity<Map<String, Object>> generateCurrentMonthRent() {
        int generated = rentPaymentService.generateCurrentMonthRentForAllActiveTenants();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "generatedCount", generated,
                "message", "Successfully generated " + generated + " rent obligations for active tenants."
        ));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update rent obligation status")
    public ResponseEntity<RentPaymentResponse> updateStatus(@PathVariable Long id, @RequestParam RentStatus status) {
        return ResponseEntity.ok(rentPaymentService.updateStatus(id, status));
    }
}
