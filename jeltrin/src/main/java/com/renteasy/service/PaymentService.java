package com.renteasy.service;

import com.renteasy.dto.PaymentRequest;
import com.renteasy.dto.PaymentResponse;
import com.renteasy.dto.ReceiptResponse;
import com.renteasy.entity.Payment;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.exception.InvalidPaymentException;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.PaymentRepository;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final TenantRepository tenantRepository;
    private final PenaltyService penaltyService;

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidPaymentException("Payment amount must be greater than zero.");
        }

        RentPayment rentPayment = rentPaymentRepository.findById(request.getRentPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Rent payment obligation not found with id: " + request.getRentPaymentId()));

        // Ensure penalty is updated before checking balance
        penaltyService.calculateAndUpdatePenalty(rentPayment, LocalDate.now());

        // Validate overpayment
        if (request.getAmount() > rentPayment.getBalanceAmount()) {
            throw new InvalidPaymentException(String.format(
                    "Payment amount ₹%.2f exceeds outstanding balance ₹%.2f.",
                    request.getAmount(), rentPayment.getBalanceAmount()
            ));
        }

        Tenant tenant = rentPayment.getTenant();
        LocalDateTime paymentTime = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDateTime.now();

        String txnRef = request.getTransactionReference();
        if (txnRef == null || txnRef.trim().isEmpty()) {
            txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Payment payment = Payment.builder()
                .rentPayment(rentPayment)
                .tenant(tenant)
                .amount(request.getAmount())
                .paymentDate(paymentTime)
                .paymentMethod(request.getPaymentMethod())
                .transactionReference(txnRef)
                .notes(request.getNotes())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update RentPayment balance and status
        double newAmountPaid = rentPayment.getAmountPaid() + request.getAmount();
        double newBalance = Math.max(0.0, rentPayment.getTotalDue() - newAmountPaid);

        rentPayment.setAmountPaid(newAmountPaid);
        rentPayment.setBalanceAmount(newBalance);

        if (newBalance == 0.0) {
            rentPayment.setStatus(RentStatus.PAID);
        } else if (newAmountPaid > 0) {
            if (LocalDate.now().isAfter(rentPayment.getDueDate())) {
                rentPayment.setStatus(RentStatus.OVERDUE);
            } else {
                rentPayment.setStatus(RentStatus.PARTIALLY_PAID);
            }
        }

        rentPaymentRepository.save(rentPayment);

        log.info("Recorded payment of ₹{} for RentPayment ID {}, updated status: {}",
                request.getAmount(), rentPayment.getRentPaymentId(), rentPayment.getStatus());

        return mapToResponse(savedPayment, rentPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllWithDetails().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByRentPayment(Long rentPaymentId) {
        return paymentRepository.findByRentPaymentId(rentPaymentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByTenant(Long tenantId) {
        return paymentRepository.findByTenantId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReceiptResponse getReceipt(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        RentPayment rp = payment.getRentPayment();
        Tenant t = payment.getTenant();
        Room r = rp != null ? rp.getRoom() : (t != null ? t.getRoom() : null);

        String receiptNum = "REC-" + payment.getPaymentDate().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + String.format("%04d", payment.getPaymentId());

        return ReceiptResponse.builder()
                .receiptNumber(receiptNum)
                .paymentId(payment.getPaymentId())
                .rentPaymentId(rp != null ? rp.getRentPaymentId() : null)
                .tenantName(t != null ? t.getFullName() : "N/A")
                .tenantPhone(t != null ? t.getPhone() : "N/A")
                .tenantEmail(t != null ? t.getEmail() : "N/A")
                .roomNumber(r != null ? r.getRoomNumber() : "N/A")
                .floor(r != null ? r.getFloor() : null)
                .billingMonth(rp != null ? rp.getBillingMonth() : "N/A")
                .baseRent(rp != null ? rp.getBaseRent() : 0.0)
                .penaltyAmount(rp != null ? rp.getPenaltyAmount() : 0.0)
                .totalDue(rp != null ? rp.getTotalDue() : 0.0)
                .paymentAmount(payment.getAmount())
                .totalAmountPaid(rp != null ? rp.getAmountPaid() : payment.getAmount())
                .remainingBalance(rp != null ? rp.getBalanceAmount() : 0.0)
                .paymentMethod(payment.getPaymentMethod())
                .transactionReference(payment.getTransactionReference())
                .paymentDate(payment.getPaymentDate())
                .notes(payment.getNotes())
                .status(rp != null ? rp.getStatus().name() : "PAID")
                .build();
    }

    public PaymentResponse mapToResponse(Payment p) {
        RentPayment rp = p.getRentPayment();
        return mapToResponse(p, rp);
    }

    public PaymentResponse mapToResponse(Payment p, RentPayment rp) {
        Tenant t = p.getTenant();
        Room r = rp != null ? rp.getRoom() : (t != null ? t.getRoom() : null);

        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .rentPaymentId(rp != null ? rp.getRentPaymentId() : null)
                .tenantId(t != null ? t.getTenantId() : null)
                .tenantName(t != null ? t.getFullName() : "Unknown")
                .tenantPhone(t != null ? t.getPhone() : null)
                .roomId(r != null ? r.getRoomId() : null)
                .roomNumber(r != null ? r.getRoomNumber() : "Unassigned")
                .billingMonth(rp != null ? rp.getBillingMonth() : "N/A")
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod())
                .transactionReference(p.getTransactionReference())
                .notes(p.getNotes())
                .updatedBalance(rp != null ? rp.getBalanceAmount() : 0.0)
                .updatedRentStatus(rp != null ? rp.getStatus() : RentStatus.PAID)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
