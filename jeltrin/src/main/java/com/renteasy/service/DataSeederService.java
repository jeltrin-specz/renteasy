package com.renteasy.service;

import com.renteasy.entity.Complaint;
import com.renteasy.entity.Payment;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.*;
import com.renteasy.repository.ComplaintRepository;
import com.renteasy.repository.PaymentRepository;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.RoomRepository;
import com.renteasy.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeederService implements CommandLineRunner {

    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final PenaltyService penaltyService;

    @Override
    @Transactional
    public void run(String... args) {
        if (roomRepository.count() > 0) {
            log.info("Database already contains data. Running penalty check on existing records.");
            refreshPenalties();
            return;
        }

        log.info("Seeding realistic PG/Hostel demo data for RENT-EASY...");

        // 1. Create 12 Rooms across 3 floors
        Room r101 = createRoom("A-101", 1, RoomType.SINGLE, 1, 9500.0, "AC, Attached Bath, Wi-Fi, Balcony, Wardrobe");
        Room r102 = createRoom("A-102", 1, RoomType.DOUBLE, 2, 7500.0, "AC, Attached Bath, Wi-Fi, Work Desk");
        Room r103 = createRoom("A-103", 1, RoomType.DOUBLE, 2, 7000.0, "Non-AC, Attached Bath, Wi-Fi, Wardrobe");
        Room r104 = createRoom("A-104", 1, RoomType.TRIPLE, 3, 5500.0, "Non-AC, Shared Bath, Wi-Fi, Study Table");

        Room r201 = createRoom("B-201", 2, RoomType.SINGLE, 1, 10000.0, "AC, Attached Bath, Smart TV, Wi-Fi, Balcony");
        Room r202 = createRoom("B-202", 2, RoomType.DOUBLE, 2, 8000.0, "AC, Attached Bath, Wi-Fi, Refrigerator Access");
        Room r203 = createRoom("B-203", 2, RoomType.DOUBLE, 2, 7500.0, "AC, Attached Bath, Wi-Fi, Geyser");
        Room r204 = createRoom("B-204", 2, RoomType.TRIPLE, 3, 5500.0, "Non-AC, Attached Bath, Wi-Fi, Lockers");

        Room r301 = createRoom("C-301", 3, RoomType.SINGLE, 1, 9000.0, "AC, Attached Bath, Wi-Fi, Terrace Access");
        Room r302 = createRoom("C-302", 3, RoomType.DOUBLE, 2, 7500.0, "AC, Shared Bath, Wi-Fi, Wardrobe");
        Room r303 = createRoom("C-303", 3, RoomType.DORMITORY, 4, 4500.0, "AC, Shared Bath, High-Speed Wi-Fi, Lockers");
        Room r304 = createRoom("C-304", 3, RoomType.DORMITORY, 4, 4500.0, "Non-AC, Shared Bath, Wi-Fi, Individual Lockers");

        roomRepository.saveAll(Arrays.asList(r101, r102, r103, r104, r201, r202, r203, r204, r301, r302, r303, r304));

        // 2. Create Tenants (7 Active assigned to rooms, 2 Vacated)
        Tenant t1 = createTenant("Arun Kumar", "9876543210", "arun.kumar@gmail.com", "HSR Layout, Bangalore", "Male",
                LocalDate.of(1998, 5, 14), "Aadhaar", "4589-1234-5678", "Ramesh Kumar", "9876500001",
                LocalDate.now().minusMonths(4), 9500.0, 19000.0, TenantStatus.ACTIVE, r101);

        Tenant t2 = createTenant("Rohan Sharma", "9845123456", "rohan.sharma@yahoo.com", "Koramangala, Bangalore", "Male",
                LocalDate.of(2000, 8, 22), "Aadhaar", "8923-4567-8901", "Sunita Sharma", "9845100002",
                LocalDate.now().minusMonths(3), 7500.0, 15000.0, TenantStatus.ACTIVE, r102);

        Tenant t3 = createTenant("Priya Patel", "9731234567", "priya.patel@outlook.com", "Indiranagar, Bangalore", "Female",
                LocalDate.of(1999, 11, 3), "PAN", "ABCDE1234F", "Kishore Patel", "9731200003",
                LocalDate.now().minusMonths(5), 10000.0, 20000.0, TenantStatus.ACTIVE, r201);

        Tenant t4 = createTenant("Vikram Singh", "9900112233", "vikram.singh@gmail.com", "Whitefield, Bangalore", "Male",
                LocalDate.of(1997, 3, 30), "Passport", "Z1234567", "Balwant Singh", "9900100004",
                LocalDate.now().minusMonths(2), 8000.0, 16000.0, TenantStatus.ACTIVE, r202);

        Tenant t5 = createTenant("Ananya Deshmukh", "9880123456", "ananya.d@gmail.com", "BTM Layout, Bangalore", "Female",
                LocalDate.of(2001, 1, 15), "Aadhaar", "3344-5566-7788", "Sanjay Deshmukh", "9880100005",
                LocalDate.now().minusMonths(3), 7500.0, 15000.0, TenantStatus.ACTIVE, r203);

        Tenant t6 = createTenant("Siddharth Verma", "9740987654", "sid.verma@techcorp.in", "Bellandur, Bangalore", "Male",
                LocalDate.of(1996, 9, 10), "Aadhaar", "1122-3344-5566", "Deepak Verma", "9740900006",
                LocalDate.now().minusMonths(1), 9000.0, 18000.0, TenantStatus.ACTIVE, r301);

        Tenant t7 = createTenant("Neha Gupta", "9663322110", "neha.gupta@fintech.co", "Marathahalli, Bangalore", "Female",
                LocalDate.of(2000, 4, 18), "Aadhaar", "9988-7766-5544", "Rajesh Gupta", "9663300007",
                LocalDate.now().minusMonths(2), 4500.0, 9000.0, TenantStatus.ACTIVE, r303);

        // Vacated tenants (room is unassigned / null)
        Tenant t8 = createTenant("Karthik Reddy", "9820011223", "karthik.r@gmail.com", "Electronic City, Bangalore", "Male",
                LocalDate.of(1995, 7, 25), "Aadhaar", "7766-5544-3322", "Venkat Reddy", "9820000008",
                LocalDate.now().minusMonths(6), 7000.0, 14000.0, TenantStatus.VACATED, null);
        t8.setMoveOutDate(LocalDate.now().minusMonths(1));

        Tenant t9 = createTenant("Meera Nair", "9538112233", "meera.nair@gmail.com", "JP Nagar, Bangalore", "Female",
                LocalDate.of(1998, 12, 5), "PAN", "XYZAB5678C", "Unnikrishnan Nair", "9538100009",
                LocalDate.now().minusMonths(7), 5500.0, 11000.0, TenantStatus.VACATED, null);
        t9.setMoveOutDate(LocalDate.now().minusMonths(2));

        // Update occupancy for assigned rooms
        r101.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        r102.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        r201.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        r202.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        r203.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        r301.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        r303.setOccupancyStatus(RoomOccupancy.OCCUPIED);
        roomRepository.saveAll(Arrays.asList(r101, r102, r201, r202, r203, r301, r303));

        tenantRepository.saveAll(Arrays.asList(t1, t2, t3, t4, t5, t6, t7, t8, t9));

        // 3. Create Rent Obligations & Payments across current and past months
        YearMonth currentYm = YearMonth.now();
        YearMonth lastYm = currentYm.minusMonths(1);
        YearMonth twoMonthsAgoYm = currentYm.minusMonths(2);

        String currentMonthStr = currentYm.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String lastMonthStr = lastYm.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String twoMonthsAgoStr = twoMonthsAgoYm.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Tenant 1 (Arun): Past 2 months PAID, Current Month PAID in full
        seedRentWithFullPayment(t1, r101, twoMonthsAgoStr, twoMonthsAgoYm.atDay(5), 9500.0, PaymentMethod.UPI, "UPI/260714592001", "Two months ago rent");
        seedRentWithFullPayment(t1, r101, lastMonthStr, lastYm.atDay(5), 9500.0, PaymentMethod.UPI, "UPI/260815683112", "Last month rent");
        seedRentWithFullPayment(t1, r101, currentMonthStr, currentYm.atDay(3), 9500.0, PaymentMethod.UPI, "UPI/260903891044", "Current month rent paid early");

        // Tenant 2 (Rohan): Past month PAID, Current Month PARTIALLY_PAID (Paid ₹4000 of ₹7500)
        seedRentWithFullPayment(t2, r102, lastMonthStr, lastYm.atDay(5), 7500.0, PaymentMethod.BANK_TRANSFER, "IMPS-98451120", "August rent");
        seedRentWithPartialPayment(t2, r102, currentMonthStr, currentYm.atDay(5), 7500.0, 4000.0, PaymentMethod.UPI, "UPI/260905443211", "Advance partial rent");

        // Tenant 3 (Priya): Past 2 months PAID, Current Month PENDING (Due 5th)
        seedRentWithFullPayment(t3, r201, twoMonthsAgoStr, twoMonthsAgoYm.atDay(5), 10000.0, PaymentMethod.CARD, "POS-TXN-88712", "July rent");
        seedRentWithFullPayment(t3, r201, lastMonthStr, lastYm.atDay(5), 10000.0, PaymentMethod.UPI, "UPI/260805129944", "August rent");
        seedRentPending(t3, r201, currentMonthStr, currentYm.atDay(5), 10000.0);

        // Tenant 4 (Vikram): Past month PAID, Current Month OVERDUE (Due on 2nd, today is overdue)
        seedRentWithFullPayment(t4, r202, lastMonthStr, lastYm.atDay(5), 8000.0, PaymentMethod.CASH, "CASH-REC-0019", "August cash payment");
        seedRentOverdue(t4, r202, currentMonthStr, currentYm.atDay(1), 8000.0);

        // Tenant 5 (Ananya): Past month PAID, Current Month OVERDUE with partial payment (Due on 3rd, base ₹7500, paid ₹2500)
        seedRentWithFullPayment(t5, r203, lastMonthStr, lastYm.atDay(5), 7500.0, PaymentMethod.UPI, "UPI/260804771233", "August rent");
        seedRentOverdueWithPartial(t5, r203, currentMonthStr, currentYm.atDay(2), 7500.0, 2500.0, PaymentMethod.UPI, "UPI/260902884411", "Initial token");

        // Tenant 6 (Siddharth): Joined this month, Current Month PENDING
        seedRentPending(t6, r301, currentMonthStr, currentYm.atDay(10), 9000.0);

        // Tenant 7 (Neha): Past month PAID, Current Month PAID in full
        seedRentWithFullPayment(t7, r303, lastMonthStr, lastYm.atDay(5), 4500.0, PaymentMethod.CASH, "CASH-REC-0024", "Cash at office");
        seedRentWithFullPayment(t7, r303, currentMonthStr, currentYm.atDay(4), 4500.0, PaymentMethod.UPI, "UPI/260904123488", "GPay payment");

        // Vacated tenants historical records
        seedRentWithFullPayment(t8, r103, twoMonthsAgoStr, twoMonthsAgoYm.atDay(5), 7000.0, PaymentMethod.UPI, "UPI/260705441299", "Vacated tenant final month");
        seedRentWithFullPayment(t9, r104, twoMonthsAgoStr, twoMonthsAgoYm.atDay(5), 5500.0, PaymentMethod.BANK_TRANSFER, "NEFT-7766120", "Settled on move out");

        // 4. Seed Maintenance Complaints
        Complaint c1 = Complaint.builder()
                .title("Water leakage in bathroom pipe")
                .description("Flush pipe is leaking water continuously creating wet floor.")
                .category(ComplaintCategory.PLUMBING)
                .priority(ComplaintPriority.HIGH)
                .status(ComplaintStatus.OPEN)
                .tenant(t1)
                .room(r101)
                .build();

        Complaint c2 = Complaint.builder()
                .title("Wi-Fi router down on 2nd Floor")
                .description("Signal strength is very weak and disconnects every 5 mins.")
                .category(ComplaintCategory.WIFI)
                .priority(ComplaintPriority.URGENT)
                .status(ComplaintStatus.IN_PROGRESS)
                .tenant(t3)
                .room(r201)
                .assignedTo("Suresh (Tech Support)")
                .adminNotes("Technician scheduled visit today at 3 PM.")
                .build();

        Complaint c3 = Complaint.builder()
                .title("AC Remote battery dead & not cooling")
                .description("Air conditioner blowing normal air instead of cool air.")
                .category(ComplaintCategory.ELECTRICAL)
                .priority(ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.RESOLVED)
                .tenant(t2)
                .room(r102)
                .assignedTo("Ramesh Electrician")
                .adminNotes("Gas refilled and remote batteries replaced.")
                .resolvedAt(LocalDateTime.now().minusDays(2))
                .build();

        Complaint c4 = Complaint.builder()
                .title("Study table chair leg broken")
                .description("Chair leg cracked and unsafe to sit on.")
                .category(ComplaintCategory.FURNITURE)
                .priority(ComplaintPriority.LOW)
                .status(ComplaintStatus.OPEN)
                .tenant(t6)
                .room(r301)
                .build();

        Complaint c5 = Complaint.builder()
                .title("Geyser heating switch tripping")
                .description("Main MCB trips whenever geyser is turned on in bathroom.")
                .category(ComplaintCategory.ELECTRICAL)
                .priority(ComplaintPriority.HIGH)
                .status(ComplaintStatus.IN_PROGRESS)
                .tenant(t5)
                .room(r203)
                .assignedTo("Ramesh Electrician")
                .adminNotes("Replacing MCB switch.")
                .build();

        complaintRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5));

        refreshPenalties();
        log.info("Demo data seeding completed successfully! Dashboard and Maintenance system ready.");
    }

    private void refreshPenalties() {
        LocalDate today = LocalDate.now();
        List<RentPayment> list = rentPaymentRepository.findAll();
        for (RentPayment rp : list) {
            penaltyService.calculateAndUpdatePenalty(rp, today);
        }
    }

    private Room createRoom(String roomNumber, int floor, RoomType type, int capacity, double rent, String amenities) {
        return Room.builder()
                .roomNumber(roomNumber)
                .floor(floor)
                .roomType(type)
                .capacity(capacity)
                .monthlyRent(rent)
                .occupancyStatus(RoomOccupancy.VACANT)
                .amenities(amenities)
                .build();
    }

    private Tenant createTenant(String name, String phone, String email, String address, String gender,
                                LocalDate dob, String idType, String idNum, String emName, String emPhone,
                                LocalDate moveIn, double rent, double deposit, TenantStatus status, Room room) {
        return Tenant.builder()
                .fullName(name)
                .phone(phone)
                .email(email)
                .address(address)
                .gender(gender)
                .dateOfBirth(dob)
                .idProofType(idType)
                .idProofNumber(idNum)
                .emergencyContactName(emName)
                .emergencyContactPhone(emPhone)
                .moveInDate(moveIn)
                .monthlyRent(rent)
                .securityDeposit(deposit)
                .status(status)
                .room(room)
                .build();
    }

    private void seedRentWithFullPayment(Tenant tenant, Room room, String billingMonth, LocalDate dueDate,
                                         double rent, PaymentMethod method, String txnRef, String notes) {
        RentPayment rp = RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth(billingMonth)
                .dueDate(dueDate)
                .baseRent(rent)
                .penaltyAmount(0.0)
                .totalDue(rent)
                .amountPaid(rent)
                .balanceAmount(0.0)
                .status(RentStatus.PAID)
                .build();
        RentPayment savedRp = rentPaymentRepository.save(rp);

        Payment p = Payment.builder()
                .rentPayment(savedRp)
                .tenant(tenant)
                .amount(rent)
                .paymentDate(dueDate.atTime(11, 30))
                .paymentMethod(method)
                .transactionReference(txnRef)
                .notes(notes)
                .build();
        paymentRepository.save(p);
    }

    private void seedRentWithPartialPayment(Tenant tenant, Room room, String billingMonth, LocalDate dueDate,
                                            double rent, double partialAmount, PaymentMethod method, String txnRef, String notes) {
        double balance = rent - partialAmount;
        RentPayment rp = RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth(billingMonth)
                .dueDate(dueDate)
                .baseRent(rent)
                .penaltyAmount(0.0)
                .totalDue(rent)
                .amountPaid(partialAmount)
                .balanceAmount(balance)
                .status(RentStatus.PARTIALLY_PAID)
                .build();
        RentPayment savedRp = rentPaymentRepository.save(rp);

        Payment p = Payment.builder()
                .rentPayment(savedRp)
                .tenant(tenant)
                .amount(partialAmount)
                .paymentDate(dueDate.minusDays(1).atTime(15, 0))
                .paymentMethod(method)
                .transactionReference(txnRef)
                .notes(notes)
                .build();
        paymentRepository.save(p);
    }

    private void seedRentPending(Tenant tenant, Room room, String billingMonth, LocalDate dueDate, double rent) {
        RentPayment rp = RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth(billingMonth)
                .dueDate(dueDate)
                .baseRent(rent)
                .penaltyAmount(0.0)
                .totalDue(rent)
                .amountPaid(0.0)
                .balanceAmount(rent)
                .status(RentStatus.PENDING)
                .build();
        rentPaymentRepository.save(rp);
    }

    private void seedRentOverdue(Tenant tenant, Room room, String billingMonth, LocalDate dueDate, double rent) {
        RentPayment rp = RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth(billingMonth)
                .dueDate(dueDate)
                .baseRent(rent)
                .penaltyAmount(0.0)
                .totalDue(rent)
                .amountPaid(0.0)
                .balanceAmount(rent)
                .status(RentStatus.OVERDUE)
                .build();
        RentPayment saved = rentPaymentRepository.save(rp);
        penaltyService.calculateAndUpdatePenalty(saved, LocalDate.now());
    }

    private void seedRentOverdueWithPartial(Tenant tenant, Room room, String billingMonth, LocalDate dueDate,
                                            double rent, double paidAmount, PaymentMethod method, String txnRef, String notes) {
        RentPayment rp = RentPayment.builder()
                .tenant(tenant)
                .room(room)
                .billingMonth(billingMonth)
                .dueDate(dueDate)
                .baseRent(rent)
                .penaltyAmount(0.0)
                .totalDue(rent)
                .amountPaid(paidAmount)
                .balanceAmount(rent - paidAmount)
                .status(RentStatus.OVERDUE)
                .build();
        RentPayment savedRp = rentPaymentRepository.save(rp);

        Payment p = Payment.builder()
                .rentPayment(savedRp)
                .tenant(tenant)
                .amount(paidAmount)
                .paymentDate(dueDate.minusDays(1).atTime(12, 0))
                .paymentMethod(method)
                .transactionReference(txnRef)
                .notes(notes)
                .build();
        paymentRepository.save(p);

        penaltyService.calculateAndUpdatePenalty(savedRp, LocalDate.now());
    }
}
