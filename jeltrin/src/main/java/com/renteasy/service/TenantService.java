package com.renteasy.service;

import com.renteasy.dto.TenantRequest;
import com.renteasy.dto.TenantResponse;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.entity.enums.RoomOccupancy;
import com.renteasy.entity.enums.TenantStatus;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.exception.RoomOccupiedException;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final PenaltyService penaltyService;

    @Value("${renteasy.rent.default-due-day:5}")
    private Integer defaultDueDay;

    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAllWithRoom().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> getActiveTenants() {
        return tenantRepository.findByStatus(TenantStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> getVacatedTenants() {
        return tenantRepository.findByStatus(TenantStatus.VACATED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> searchTenants(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllTenants();
        }
        return tenantRepository.searchTenants(query.trim()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + tenantId));
        return mapToResponse(tenant);
    }

    @Transactional
    public TenantResponse registerTenant(TenantRequest request) {
        Room assignedRoom = null;
        if (request.getRoomId() != null) {
            assignedRoom = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));

            // Check if room is already occupied
            if (assignedRoom.getOccupancyStatus() == RoomOccupancy.OCCUPIED) {
                throw new RoomOccupiedException("Room " + assignedRoom.getRoomNumber() + " is already occupied and cannot be assigned.");
            }

            // Mark room occupied
            assignedRoom.setOccupancyStatus(RoomOccupancy.OCCUPIED);
            roomRepository.save(assignedRoom);
        }

        Tenant tenant = Tenant.builder()
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .address(request.getAddress())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .idProofType(request.getIdProofType())
                .idProofNumber(request.getIdProofNumber())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .moveInDate(request.getMoveInDate())
                .monthlyRent(request.getMonthlyRent())
                .securityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : 0.0)
                .status(TenantStatus.ACTIVE)
                .room(assignedRoom)
                .build();

        Tenant savedTenant = tenantRepository.save(tenant);
        log.info("Registered tenant {} with ID {} and assigned to room {}",
                savedTenant.getFullName(), savedTenant.getTenantId(),
                assignedRoom != null ? assignedRoom.getRoomNumber() : "None");

        // Automatically generate initial RentPayment obligation for the move-in month
        generateInitialRentObligation(savedTenant, assignedRoom);

        return mapToResponse(savedTenant);
    }

    @Transactional
    public TenantResponse updateTenant(Long tenantId, TenantRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + tenantId));

        Room currentRoom = tenant.getRoom();
        Long newRoomId = request.getRoomId();

        // Handle room change
        if (newRoomId != null && (currentRoom == null || !currentRoom.getRoomId().equals(newRoomId))) {
            Room newRoom = roomRepository.findById(newRoomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + newRoomId));

            if (newRoom.getOccupancyStatus() == RoomOccupancy.OCCUPIED) {
                throw new RoomOccupiedException("Room " + newRoom.getRoomNumber() + " is already occupied.");
            }

            // Free previous room
            if (currentRoom != null) {
                currentRoom.setOccupancyStatus(RoomOccupancy.VACANT);
                roomRepository.save(currentRoom);
            }

            // Assign new room
            newRoom.setOccupancyStatus(RoomOccupancy.OCCUPIED);
            roomRepository.save(newRoom);
            tenant.setRoom(newRoom);
        } else if (newRoomId == null && currentRoom != null) {
            // Unassign room without vacating
            currentRoom.setOccupancyStatus(RoomOccupancy.VACANT);
            roomRepository.save(currentRoom);
            tenant.setRoom(null);
        }

        tenant.setFullName(request.getFullName().trim());
        tenant.setPhone(request.getPhone().trim());
        tenant.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        tenant.setAddress(request.getAddress());
        tenant.setGender(request.getGender());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setIdProofType(request.getIdProofType());
        tenant.setIdProofNumber(request.getIdProofNumber());
        tenant.setEmergencyContactName(request.getEmergencyContactName());
        tenant.setEmergencyContactPhone(request.getEmergencyContactPhone());
        tenant.setMonthlyRent(request.getMonthlyRent());
        if (request.getSecurityDeposit() != null) {
            tenant.setSecurityDeposit(request.getSecurityDeposit());
        }

        Tenant updatedTenant = tenantRepository.save(tenant);
        return mapToResponse(updatedTenant);
    }

    @Transactional
    public TenantResponse vacateTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + tenantId));

        if (tenant.getStatus() == TenantStatus.VACATED) {
            log.warn("Tenant {} is already vacated", tenantId);
            return mapToResponse(tenant);
        }

        Room room = tenant.getRoom();
        if (room != null) {
            room.setOccupancyStatus(RoomOccupancy.VACANT);
            roomRepository.save(room);
            tenant.setRoom(null);
        }

        tenant.setStatus(TenantStatus.VACATED);
        tenant.setMoveOutDate(LocalDate.now());

        Tenant vacated = tenantRepository.save(tenant);
        log.info("Tenant {} (ID: {}) vacated successfully. Room released.", vacated.getFullName(), tenantId);

        return mapToResponse(vacated);
    }

    @Transactional
    public void deleteTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + tenantId));

        Room room = tenant.getRoom();
        if (room != null) {
            room.setOccupancyStatus(RoomOccupancy.VACANT);
            roomRepository.save(room);
        }

        tenantRepository.delete(tenant);
        log.info("Deleted tenant with ID {}", tenantId);
    }

    private void generateInitialRentObligation(Tenant tenant, Room room) {
        YearMonth currentYearMonth = YearMonth.now();
        String billingMonth = currentYearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        if (!rentPaymentRepository.existsByTenantTenantIdAndBillingMonth(tenant.getTenantId(), billingMonth)) {
            int dueDay = Math.min(defaultDueDay, currentYearMonth.lengthOfMonth());
            LocalDate dueDate = currentYearMonth.atDay(dueDay);

            // If move in date is after due date, use move-in date + 5 days or move-in date
            if (tenant.getMoveInDate().isAfter(dueDate)) {
                dueDate = tenant.getMoveInDate().plusDays(5);
            }

            RentPayment initialRent = RentPayment.builder()
                    .tenant(tenant)
                    .room(room)
                    .billingMonth(billingMonth)
                    .dueDate(dueDate)
                    .baseRent(tenant.getMonthlyRent())
                    .penaltyAmount(0.0)
                    .totalDue(tenant.getMonthlyRent())
                    .amountPaid(0.0)
                    .balanceAmount(tenant.getMonthlyRent())
                    .status(RentStatus.PENDING)
                    .build();

            rentPaymentRepository.save(initialRent);
            log.info("Created initial rent payment obligation for tenant {} for month {}", tenant.getFullName(), billingMonth);
        }
    }

    public TenantResponse mapToResponse(Tenant tenant) {
        // Fetch all rent payments for this tenant to compute metrics
        List<RentPayment> rentPayments = rentPaymentRepository.findByTenantTenantIdOrderByBillingMonthDesc(tenant.getTenantId());

        LocalDate today = LocalDate.now();
        double totalExpected = 0.0;
        double totalPaid = 0.0;
        double totalOutstanding = 0.0;
        double totalPenalties = 0.0;
        int unpaidMonths = 0;
        RentStatus currentMonthStatus = RentStatus.PENDING;

        String currentBillingMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        for (RentPayment rp : rentPayments) {
            // Apply penalty check idempotently if overdue
            penaltyService.calculateAndUpdatePenalty(rp, today);

            totalExpected += rp.getTotalDue();
            totalPaid += rp.getAmountPaid();
            totalOutstanding += rp.getBalanceAmount();
            totalPenalties += rp.getPenaltyAmount();

            if (rp.getStatus() != RentStatus.PAID) {
                unpaidMonths++;
            }

            if (rp.getBillingMonth().equals(currentBillingMonth)) {
                currentMonthStatus = rp.getStatus();
            }
        }

        Room room = tenant.getRoom();

        return TenantResponse.builder()
                .tenantId(tenant.getTenantId())
                .fullName(tenant.getFullName())
                .phone(tenant.getPhone())
                .email(tenant.getEmail())
                .address(tenant.getAddress())
                .gender(tenant.getGender())
                .dateOfBirth(tenant.getDateOfBirth())
                .idProofType(tenant.getIdProofType())
                .idProofNumber(tenant.getIdProofNumber())
                .emergencyContactName(tenant.getEmergencyContactName())
                .emergencyContactPhone(tenant.getEmergencyContactPhone())
                .moveInDate(tenant.getMoveInDate())
                .moveOutDate(tenant.getMoveOutDate())
                .monthlyRent(tenant.getMonthlyRent())
                .securityDeposit(tenant.getSecurityDeposit())
                .status(tenant.getStatus())
                .roomId(room != null ? room.getRoomId() : null)
                .roomNumber(room != null ? room.getRoomNumber() : "Unassigned")
                .floor(room != null ? room.getFloor() : null)
                .roomType(room != null ? room.getRoomType().name() : null)
                .totalExpectedRent(totalExpected)
                .totalAmountPaid(totalPaid)
                .totalOutstandingDues(totalOutstanding)
                .totalPenalties(totalPenalties)
                .currentMonthStatus(currentMonthStatus)
                .unpaidMonthsCount(unpaidMonths)
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
