package com.renteasy.controller;
import com.renteasy.dto.PaymentRequest;
import com.renteasy.dto.PaymentResponse;
import com.renteasy.dto.ReceiptResponse;
import com.renteasy.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "04 Payments", description = "Endpoints for recording rent transactions, viewing payment history, and generating digital receipts")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Record a rent payment transaction (supports full or partial payments, rejects overpayment with 400 Bad Request)")
    public ResponseEntity<PaymentResponse> recordPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.recordPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all payment transaction records ordered by date descending")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment transaction by ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/rent/{rentPaymentId}")
    @Operation(summary = "Get all payment transactions for a specific monthly rent obligation")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByRentPayment(@PathVariable Long rentPaymentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByRentPayment(rentPaymentId));
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get all payment transactions made by a specific tenant")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTenant(@PathVariable Long tenantId) {
        return ResponseEntity.ok(paymentService.getPaymentsByTenant(tenantId));
    }

    @GetMapping("/{id}/receipt")
    @Operation(summary = "Generate and retrieve a digital PG rent receipt for a specific payment")
    public ResponseEntity<ReceiptResponse> getPaymentReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getReceipt(id));
    }
}
