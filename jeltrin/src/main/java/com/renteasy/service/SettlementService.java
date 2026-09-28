package com.renteasy.service;

import com.renteasy.dto.SettlementPreviewResponse;
import com.renteasy.dto.SettlementRequest;
import com.renteasy.dto.SettlementResponse;
import com.renteasy.entity.Settlement;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.entity.enums.SettlementStatus;
import com.renteasy.entity.enums.TenantStatus;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.SettlementRepository;
import com.renteasy.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final TenantRepository tenantRepository;
    private final RentPaymentRepository rentPaymentRepository;

    /**
     * Generate a settlement preview for a tenant before finalizing.
     */
    @Transactional(readOnly = true)
    public SettlementPreviewResponse previewSettlement(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + tenantId));

        double unpaidRent = calculateUnpaidRent(tenantId);
        double securityDeposit = tenant.getSecurityDeposit() != null ? tenant.getSecurityDeposit() : 0.0;

        return SettlementPreviewResponse.builder()
                .tenantId(tenant.getTenantId())
                .tenantName(tenant.getFullName())
                .securityDeposit(securityDeposit)
                .unpaidRentAmount(unpaidRent)
                .estimatedRefund(securityDeposit - unpaidRent)
                .build();
    }

    /**
     * Finalize a settlement for a tenant who is checking out.
     */
    @Transactional
    public SettlementResponse createSettlement(SettlementRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + request.getTenantId()));

        double securityDeposit = tenant.getSecurityDeposit() != null ? tenant.getSecurityDeposit() : 0.0;
        double unpaidRent = calculateUnpaidRent(request.getTenantId());
        double damageDeductions = request.getDamageDeductions() != null ? request.getDamageDeductions() : 0.0;
        double cleaningDeductions = request.getCleaningDeductions() != null ? request.getCleaningDeductions() : 0.0;
        double otherDeductions = request.getOtherDeductions() != null ? request.getOtherDeductions() : 0.0;

        double totalDeductions = unpaidRent + damageDeductions + cleaningDeductions + otherDeductions;
        double netRefund = securityDeposit - totalDeductions;

        SettlementStatus status = netRefund > 0 ? SettlementStatus.REFUNDED : SettlementStatus.RETAINED;

        Settlement settlement = Settlement.builder()
                .tenant(tenant)
                .room(tenant.getRoom())
                .settlementDate(request.getSettlementDate() != null ? request.getSettlementDate() : LocalDate.now())
                .securityDeposit(securityDeposit)
                .unpaidRentAmount(unpaidRent)
                .unpaidPenaltyAmount(0.0)
                .damageDeductions(damageDeductions)
                .cleaningDeductions(cleaningDeductions)
                .otherDeductions(otherDeductions)
                .totalDeductions(totalDeductions)
                .netRefundAmount(netRefund)
                .paymentMethod(request.getPaymentMethod())
                .transactionReference(request.getTransactionReference())
                .notes(request.getNotes())
                .status(status)
                .build();

        Settlement saved = settlementRepository.save(settlement);

        // Mark tenant as vacated
        tenant.setStatus(TenantStatus.VACATED);
        tenant.setMoveOutDate(settlement.getSettlementDate());
        tenantRepository.save(tenant);

        log.info("Settlement created for tenant {} with net refund: {}", tenant.getFullName(), netRefund);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> getAllSettlements() {
        return settlementRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SettlementResponse getSettlementById(Long id) {
        Settlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found with id: " + id));
        return mapToResponse(settlement);
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> getSettlementsByTenant(Long tenantId) {
        return settlementRepository.findByTenant_TenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private double calculateUnpaidRent(Long tenantId) {
        return rentPaymentRepository.findByTenantTenantIdOrderByBillingMonthDesc(tenantId).stream()
                .filter(r -> r.getStatus() == RentStatus.UNPAID || r.getStatus() == RentStatus.OVERDUE)
                .mapToDouble(r -> r.getAmountDue() != null ? r.getAmountDue() : 0.0)
                .sum();
    }

    private SettlementResponse mapToResponse(Settlement s) {
        return SettlementResponse.builder()
                .settlementId(s.getSettlementId())
                .tenantId(s.getTenant().getTenantId())
                .tenantName(s.getTenant().getFullName())
                .tenantPhone(s.getTenant().getPhone())
                .roomId(s.getRoom() != null ? s.getRoom().getRoomId() : null)
                .roomNumber(s.getRoom() != null ? s.getRoom().getRoomNumber() : null)
                .settlementDate(s.getSettlementDate())
                .securityDeposit(s.getSecurityDeposit())
                .unpaidRentAmount(s.getUnpaidRentAmount())
                .unpaidPenaltyAmount(s.getUnpaidPenaltyAmount())
                .damageDeductions(s.getDamageDeductions())
                .cleaningDeductions(s.getCleaningDeductions())
                .otherDeductions(s.getOtherDeductions())
                .totalDeductions(s.getTotalDeductions())
                .netRefundAmount(s.getNetRefundAmount())
                .paymentMethod(s.getPaymentMethod())
                .transactionReference(s.getTransactionReference())
                .notes(s.getNotes())
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
