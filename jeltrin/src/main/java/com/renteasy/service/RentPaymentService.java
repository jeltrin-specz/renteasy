package com.renteasy.service;

import com.renteasy.dto.PendingRentResponse;
import com.renteasy.dto.RentPaymentRequest;
import com.renteasy.dto.RentPaymentResponse;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.entity.enums.TenantStatus;
import com.renteasy.exception.DuplicateResourceException;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.RoomRepository;
import com.renteasy.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentPaymentService {

    private final RentPaymentRepository rentPaymentRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final PenaltyService penaltyService;

    @Value("${renteasy.rent.default-due-day:5}")
    private Integer defaultDueDay;

    @Transactional
    public List<RentPaymentResponse> getAllRentPayments(String billingMonth, RentStatus status) {
        LocalDate today = LocalDate.now();
        List<RentPayment> list;

        if (billingMonth != null && !billingMonth.isEmpty() && status != null) {
            list = rentPaymentRepository.findByBillingMonth(billingMonth).stream()
                    .filter(rp -> rp.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (billingMonth != null && !billingMonth.isEmpty()) {
            list = rentPaymentRepository.findByBillingMonth(billingMonth);
        } else if (status != null) {
            list = rentPaymentRepository.findByStatus(status);
        } else {
            list = rentPaymentRepository.findAllWithTenantAndRoom();
        }

        // Apply dynamic penalty updates
        return list.stream()
                .map(rp -> penaltyService.calculateAndUpdatePenalty(rp, today))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RentPaymentResponse getRentPaymentById(Long id) {
        RentPayment rentPayment = rentPaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rent payment obligation not found with id: " + id));

        RentPayment updated = penaltyService.calculateAndUpdatePenalty(rentPayment, LocalDate.now());
        return mapToResponse(updated);
    }

    @Transactional
    public List<RentPaymentResponse> getRentPaymentsByTenant(Long tenantId) {
        LocalDate today = LocalDate.now();
        return rentPaymentRepository.findByTenantTenantIdOrderByBillingMonthDesc(tenantId).stream()
                .map(rp -> penaltyService.calculateAndUpdatePenalty(rp, today))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PendingRentResponse> getCurrentMonthPending() {
        String currentBillingMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDate today = LocalDate.now();

        List<RentPayment> list = rentPaymentRepository.findByBillingMonth(currentBillingMonth);
        return list.stream()
                .map(rp -> penaltyService.calculateAndUpdatePenalty(rp, today))
                .filter(rp -> rp.getStatus() != RentStatus.PAID)
                .map(this::mapToPendingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PendingRentResponse> getAllOverdue() {
        LocalDate today = LocalDate.now();
        List<RentPayment> list = rentPaymentRepository.findAllWithTenantAndRoom();
        return list.stream()
                .map(rp -> penaltyService.calculateAndUpdatePenalty(rp, today))
                .filter(rp -> rp.getStatus() == RentStatus.OVERDUE || (rp.getDueDate().isBefore(today) && rp.getBalanceAmount() > 0))
                .map(this::mapToPendingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PendingRentResponse> getAllPending() {
        LocalDate today = LocalDate.now();
        List<RentPayment> list = rentPaymentRepository.findAllWithTenantAndRoom();
        return list.stream()
                .map(rp -> penaltyService.calculateAndUpdatePenalty(rp, today))
                .filter(rp -> rp.getStatus() == RentStatus.PENDING || rp.getStatus() == RentStatus.PARTIALLY_PAID)
                .map(this::mapToPendingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RentPaymentResponse createRentPayment(RentPaymentRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + request.getTenantId()));

        if (rentPaymentRepository.existsByTenantTenantIdAndBillingMonth(tenant.getTenantId(), request.getBillingMonth())) {
            throw new DuplicateResourceException("Rent obligation already exists for tenant " + tenant.getFullName() +
                    " and month " + request.getBillingMonth());
        }

        Room room = tenant.getRoom();
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId()).orElse(room);
        }

        double penalty = request.getPenaltyAmount() != null ? request.getPenaltyAmount() : 0.0;
        double totalDue = request.getBaseRent() + penalty;

        RentPayment rentPayment = RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth(request.getBillingMonth())
                .dueDate(request.getDueDate())
                .baseRent(request.getBaseRent())
                .penaltyAmount(penalty)
                .totalDue(totalDue)
                .amountPaid(0.0)
                .balanceAmount(totalDue)
                .status(request.getStatus() != null ? request.getStatus() : RentStatus.PENDING)
                .build();

        RentPayment saved = rentPaymentRepository.save(rentPayment);
        return mapToResponse(saved);
    }

    @Transactional
    public int generateCurrentMonthRentForAllActiveTenants() {
        YearMonth currentYearMonth = YearMonth.now();
        String billingMonth = currentYearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        int dueDay = Math.min(defaultDueDay, currentYearMonth.lengthOfMonth());
        LocalDate dueDate = currentYearMonth.atDay(dueDay);

        List<Tenant> activeTenants = tenantRepository.findByStatus(TenantStatus.ACTIVE);
        int generatedCount = 0;

        for (Tenant tenant : activeTenants) {
            if (!rentPaymentRepository.existsByTenantTenantIdAndBillingMonth(tenant.getTenantId(), billingMonth)) {
                LocalDate actualDueDate = dueDate;
                if (tenant.getMoveInDate() != null && tenant.getMoveInDate().isAfter(dueDate)) {
                    actualDueDate = tenant.getMoveInDate().plusDays(5);
                }

                RentPayment obligation = RentPayment.builder()
                        .tenant(tenant)
                        .room(tenant.getRoom())
                        .billingMonth(billingMonth)
                        .dueDate(actualDueDate)
                        .baseRent(tenant.getMonthlyRent())
                        .penaltyAmount(0.0)
                        .totalDue(tenant.getMonthlyRent())
                        .amountPaid(0.0)
                        .balanceAmount(tenant.getMonthlyRent())
                        .status(RentStatus.PENDING)
                        .build();

                rentPaymentRepository.save(obligation);
                generatedCount++;
            }
        }

        log.info("Generated {} monthly rent obligations for month {}", generatedCount, billingMonth);
        return generatedCount;
    }

    @Transactional
    public RentPaymentResponse updateStatus(Long id, RentStatus status) {
        RentPayment rentPayment = rentPaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rent payment obligation not found with id: " + id));

        rentPayment.setStatus(status);
        RentPayment saved = rentPaymentRepository.save(rentPayment);
        return mapToResponse(saved);
    }

    public RentPaymentResponse mapToResponse(RentPayment rp) {
        Tenant t = rp.getTenant();
        Room r = rp.getRoom();
        long daysOverdue = penaltyService.calculateOverdueDays(rp, LocalDate.now());

        return RentPaymentResponse.builder()
                .rentPaymentId(rp.getRentPaymentId())
                .tenantId(t != null ? t.getTenantId() : null)
                .tenantName(t != null ? t.getFullName() : "Unknown")
                .tenantPhone(t != null ? t.getPhone() : null)
                .roomId(r != null ? r.getRoomId() : null)
                .roomNumber(r != null ? r.getRoomNumber() : (t != null && t.getRoom() != null ? t.getRoom().getRoomNumber() : "Unassigned"))
                .billingMonth(rp.getBillingMonth())
                .dueDate(rp.getDueDate())
                .baseRent(rp.getBaseRent())
                .penaltyAmount(rp.getPenaltyAmount())
                .totalDue(rp.getTotalDue())
                .amountPaid(rp.getAmountPaid())
                .balanceAmount(rp.getBalanceAmount())
                .status(rp.getStatus())
                .daysOverdue(daysOverdue)
                .createdAt(rp.getCreatedAt())
                .updatedAt(rp.getUpdatedAt())
                .build();
    }

    public PendingRentResponse mapToPendingResponse(RentPayment rp) {
        Tenant t = rp.getTenant();
        Room r = rp.getRoom();
        long daysOverdue = penaltyService.calculateOverdueDays(rp, LocalDate.now());

        return PendingRentResponse.builder()
                .rentPaymentId(rp.getRentPaymentId())
                .tenantId(t != null ? t.getTenantId() : null)
                .tenantName(t != null ? t.getFullName() : "Unknown")
                .tenantPhone(t != null ? t.getPhone() : null)
                .roomId(r != null ? r.getRoomId() : null)
                .roomNumber(r != null ? r.getRoomNumber() : (t != null && t.getRoom() != null ? t.getRoom().getRoomNumber() : "Unassigned"))
                .billingMonth(rp.getBillingMonth())
                .monthlyRent(rp.getBaseRent())
                .penalty(rp.getPenaltyAmount())
                .totalDue(rp.getTotalDue())
                .amountPaid(rp.getAmountPaid())
                .balance(rp.getBalanceAmount())
                .dueDate(rp.getDueDate())
                .status(rp.getStatus())
                .daysOverdue(daysOverdue)
                .build();
    }
}
