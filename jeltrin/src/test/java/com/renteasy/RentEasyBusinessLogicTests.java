package com.renteasy;

import com.renteasy.dto.PaymentRequest;
import com.renteasy.dto.PaymentResponse;
import com.renteasy.dto.RoomRequest;
import com.renteasy.dto.TenantRequest;
import com.renteasy.dto.TenantResponse;
import com.renteasy.entity.Payment;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.PaymentMethod;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.entity.enums.RoomOccupancy;
import com.renteasy.entity.enums.RoomType;
import com.renteasy.entity.enums.TenantStatus;
import com.renteasy.exception.InvalidPaymentException;
import com.renteasy.exception.RoomOccupiedException;
import com.renteasy.repository.PaymentRepository;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.RoomRepository;
import com.renteasy.repository.TenantRepository;
import com.renteasy.service.PaymentService;
import com.renteasy.service.PenaltyService;
import com.renteasy.service.RentPaymentService;
import com.renteasy.service.RoomService;
import com.renteasy.service.TenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class RentEasyBusinessLogicTests {

    @Autowired
    private RoomService roomService;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private RentPaymentService rentPaymentService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PenaltyService penaltyService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private RentPaymentRepository rentPaymentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @DisplayName("Scenario 1 & 2: Assign room, verify OCCUPIED, reject second assignment with 409 Conflict")
    void testRoomAssignmentAndConflict() {
        // Create a new vacant room
        RoomRequest roomReq = RoomRequest.builder()
                .roomNumber("TEST-101")
                .floor(1)
                .roomType(RoomType.SINGLE)
                .capacity(1)
                .monthlyRent(8000.0)
                .amenities("AC, Wi-Fi")
                .build();
        var roomResp = roomService.createRoom(roomReq);
        assertEquals(RoomOccupancy.VACANT, roomResp.getOccupancyStatus());

        // Register first tenant in this room
        TenantRequest t1Req = TenantRequest.builder()
                .fullName("Test Tenant 1")
                .phone("9111111111")
                .email("t1@test.com")
                .moveInDate(LocalDate.now())
                .monthlyRent(8000.0)
                .securityDeposit(16000.0)
                .roomId(roomResp.getRoomId())
                .build();
        TenantResponse t1 = tenantService.registerTenant(t1Req);
        assertEquals(TenantStatus.ACTIVE, t1.getStatus());

        // Verify room is now OCCUPIED
        var updatedRoom = roomService.getRoomById(roomResp.getRoomId());
        assertEquals(RoomOccupancy.OCCUPIED, updatedRoom.getOccupancyStatus());

        // Attempt to register a second tenant in the same occupied room -> must throw RoomOccupiedException
        TenantRequest t2Req = TenantRequest.builder()
                .fullName("Test Tenant 2")
                .phone("9222222222")
                .email("t2@test.com")
                .moveInDate(LocalDate.now())
                .monthlyRent(8000.0)
                .securityDeposit(16000.0)
                .roomId(roomResp.getRoomId())
                .build();

        assertThrows(RoomOccupiedException.class, () -> tenantService.registerTenant(t2Req));
    }

    @Test
    @DisplayName("Scenario 5, 6 & 7: Partial payment, full payment, and reject overpayment")
    void testPaymentFlowAndOverpaymentRejection() {
        // Create a room & tenant
        var room = roomRepository.save(Room.builder()
                .roomNumber("TEST-201")
                .floor(2)
                .roomType(RoomType.DOUBLE)
                .capacity(2)
                .monthlyRent(10000.0)
                .occupancyStatus(RoomOccupancy.OCCUPIED)
                .build());

        var tenant = tenantRepository.save(Tenant.builder()
                .fullName("Payment Tester")
                .phone("9333333333")
                .moveInDate(LocalDate.now())
                .monthlyRent(10000.0)
                .status(TenantStatus.ACTIVE)
                .room(room)
                .build());

        // Create rent obligation for ₹10,000
        var rentPayment = rentPaymentRepository.save(RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth("2026-10")
                .dueDate(LocalDate.now().plusDays(5))
                .baseRent(10000.0)
                .penaltyAmount(0.0)
                .totalDue(10000.0)
                .amountPaid(0.0)
                .balanceAmount(10000.0)
                .status(RentStatus.PENDING)
                .build());

        // 1. Attempt overpayment: ₹12,000 > ₹10,000 balance -> must throw InvalidPaymentException
        PaymentRequest overpaymentReq = PaymentRequest.builder()
                .rentPaymentId(rentPayment.getRentPaymentId())
                .amount(12000.0)
                .paymentMethod(PaymentMethod.UPI)
                .build();
        assertThrows(InvalidPaymentException.class, () -> paymentService.recordPayment(overpaymentReq));

        // 2. Partial payment: ₹4,000
        PaymentRequest partialReq = PaymentRequest.builder()
                .rentPaymentId(rentPayment.getRentPaymentId())
                .amount(4000.0)
                .paymentMethod(PaymentMethod.UPI)
                .notes("Part 1")
                .build();
        PaymentResponse p1 = paymentService.recordPayment(partialReq);
        assertEquals(6000.0, p1.getUpdatedBalance());
        assertEquals(RentStatus.PARTIALLY_PAID, p1.getUpdatedRentStatus());

        // 3. Complete remaining balance: ₹6,000
        PaymentRequest remainingReq = PaymentRequest.builder()
                .rentPaymentId(rentPayment.getRentPaymentId())
                .amount(6000.0)
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .notes("Part 2 - Final")
                .build();
        PaymentResponse p2 = paymentService.recordPayment(remainingReq);
        assertEquals(0.0, p2.getUpdatedBalance());
        assertEquals(RentStatus.PAID, p2.getUpdatedRentStatus());
    }

    @Test
    @DisplayName("Scenario 4 & 9: Overdue rent penalty calculation and idempotency")
    void testPenaltyCalculationAndIdempotency() {
        var tenant = tenantRepository.save(Tenant.builder()
                .fullName("Penalty Tester")
                .phone("9555555555")
                .moveInDate(LocalDate.now().minusMonths(3))
                .monthlyRent(8000.0)
                .status(TenantStatus.ACTIVE)
                .build());

        RentPayment rent = rentPaymentRepository.save(RentPayment.builder()
                .tenant(tenant)
                .billingMonth("2026-08")
                .dueDate(LocalDate.now().minusDays(5)) // 5 days overdue
                .baseRent(8000.0)
                .penaltyAmount(0.0)
                .totalDue(8000.0)
                .amountPaid(0.0)
                .balanceAmount(8000.0)
                .status(RentStatus.PENDING)
                .build());

        // Calculate penalty for 5 days overdue @ ₹100/day = ₹500
        RentPayment updated = penaltyService.calculateAndUpdatePenalty(rent, LocalDate.now());
        assertEquals(500.0, updated.getPenaltyAmount());
        assertEquals(8500.0, updated.getTotalDue());
        assertEquals(8500.0, updated.getBalanceAmount());
        assertEquals(RentStatus.OVERDUE, updated.getStatus());

        // Verify IDEMPOTENCY: calling again on the same day must NOT add another ₹500
        RentPayment updatedAgain = penaltyService.calculateAndUpdatePenalty(updated, LocalDate.now());
        assertEquals(500.0, updatedAgain.getPenaltyAmount());
        assertEquals(8500.0, updatedAgain.getTotalDue());
        assertEquals(8500.0, updatedAgain.getBalanceAmount());
    }

    @Test
    @DisplayName("Scenario 8: Vacate tenant releases room to VACANT while preserving payment history")
    void testVacateTenantFlow() {
        Room room = roomRepository.save(Room.builder()
                .roomNumber("TEST-301")
                .floor(3)
                .roomType(RoomType.SINGLE)
                .capacity(1)
                .monthlyRent(9000.0)
                .occupancyStatus(RoomOccupancy.OCCUPIED)
                .build());

        Tenant tenant = tenantRepository.save(Tenant.builder()
                .fullName("Vacate Tester")
                .phone("9444444444")
                .moveInDate(LocalDate.now().minusMonths(2))
                .monthlyRent(9000.0)
                .status(TenantStatus.ACTIVE)
                .room(room)
                .build());

        RentPayment rent = rentPaymentRepository.save(RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth("2026-07")
                .dueDate(LocalDate.now().minusMonths(2))
                .baseRent(9000.0)
                .penaltyAmount(0.0)
                .totalDue(9000.0)
                .amountPaid(9000.0)
                .balanceAmount(0.0)
                .status(RentStatus.PAID)
                .build());

        paymentRepository.save(Payment.builder()
                .rentPayment(rent)
                .tenant(tenant)
                .amount(9000.0)
                .paymentDate(LocalDate.now().minusMonths(2).atTime(10, 0))
                .paymentMethod(PaymentMethod.UPI)
                .build());

        // Vacate the tenant
        TenantResponse vacatedResp = tenantService.vacateTenant(tenant.getTenantId());
        assertEquals(TenantStatus.VACATED, vacatedResp.getStatus());

        // Room must now be VACANT
        Room updatedRoom = roomRepository.findById(room.getRoomId()).orElseThrow();
        assertEquals(RoomOccupancy.VACANT, updatedRoom.getOccupancyStatus());

        // Historical payments must still exist!
        List<Payment> history = paymentRepository.findByTenantId(tenant.getTenantId());
        assertFalse(history.isEmpty());
        assertEquals(9000.0, history.get(0).getAmount());
    }
}
