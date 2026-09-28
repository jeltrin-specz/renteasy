package com.renteasy.service;

import com.renteasy.dto.DashboardResponse;
import com.renteasy.dto.PaymentResponse;
import com.renteasy.dto.PendingRentResponse;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Room;
import com.renteasy.entity.enums.RentStatus;
import com.renteasy.entity.enums.RoomOccupancy;
import com.renteasy.entity.enums.RoomType;
import com.renteasy.entity.enums.TenantStatus;
import com.renteasy.repository.PaymentRepository;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.RoomRepository;
import com.renteasy.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final PaymentRepository paymentRepository;
    private final PenaltyService penaltyService;
    private final RentPaymentService rentPaymentService;
    private final PaymentService paymentService;

    @Transactional
    public DashboardResponse getDashboardSummary() {
        LocalDate today = LocalDate.now();
        YearMonth currentYearMonth = YearMonth.now();
        String currentBillingMonth = currentYearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Refresh penalties for all active obligations
        List<RentPayment> allRentPayments = rentPaymentRepository.findAllWithTenantAndRoom();
        for (RentPayment rp : allRentPayments) {
            penaltyService.calculateAndUpdatePenalty(rp, today);
        }

        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.countByStatus(TenantStatus.ACTIVE);
        long vacatedTenants = tenantRepository.countByStatus(TenantStatus.VACATED);

        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.countByOccupancyStatus(RoomOccupancy.OCCUPIED);
        long vacantRooms = roomRepository.countByOccupancyStatus(RoomOccupancy.VACANT);
        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100.0 : 0.0;

        // Current Month Metrics
        List<RentPayment> currentMonthList = rentPaymentRepository.findByBillingMonth(currentBillingMonth);
        double currentMonthCollected = 0.0;
        double currentMonthPending = 0.0;
        long paidCount = 0;
        long pendingCount = 0;
        long overdueCount = 0;

        for (RentPayment rp : currentMonthList) {
            currentMonthCollected += rp.getAmountPaid();
            if (rp.getStatus() == RentStatus.PAID) {
                paidCount++;
            } else {
                currentMonthPending += rp.getBalanceAmount();
                if (rp.getStatus() == RentStatus.OVERDUE || (rp.getDueDate().isBefore(today) && rp.getBalanceAmount() > 0)) {
                    overdueCount++;
                } else {
                    pendingCount++;
                }
            }
        }

        // Total Overdue across all months
        double totalOverdueAmount = 0.0;
        double totalPenalties = 0.0;
        for (RentPayment rp : allRentPayments) {
            totalPenalties += rp.getPenaltyAmount();
            if (rp.getStatus() == RentStatus.OVERDUE || (rp.getDueDate().isBefore(today) && rp.getBalanceAmount() > 0)) {
                totalOverdueAmount += rp.getBalanceAmount();
            }
        }

        Double totalRevenue = paymentRepository.sumTotalPayments();
        if (totalRevenue == null) totalRevenue = 0.0;

        // Monthly Collection Trends (last 6 months)
        List<DashboardResponse.MonthlyTrendDTO> trends = new ArrayList<>();
        DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYearMonth.minusMonths(i);
            String monthKey = ym.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String displayMonth = ym.format(displayFormatter);

            List<RentPayment> monthRents = rentPaymentRepository.findByBillingMonth(monthKey);
            double collected = 0.0;
            double pending = 0.0;
            double overdue = 0.0;

            for (RentPayment rp : monthRents) {
                collected += rp.getAmountPaid();
                if (rp.getStatus() == RentStatus.OVERDUE || (rp.getDueDate().isBefore(today) && rp.getBalanceAmount() > 0)) {
                    overdue += rp.getBalanceAmount();
                } else if (rp.getStatus() != RentStatus.PAID) {
                    pending += rp.getBalanceAmount();
                }
            }

            trends.add(DashboardResponse.MonthlyTrendDTO.builder()
                    .month(displayMonth)
                    .collected(Math.round(collected * 100.0) / 100.0)
                    .pending(Math.round(pending * 100.0) / 100.0)
                    .overdue(Math.round(overdue * 100.0) / 100.0)
                    .build());
        }

        // Occupancy by room type
        List<Room> allRooms = roomRepository.findAll();
        Map<RoomType, List<Room>> roomsByType = allRooms.stream().collect(Collectors.groupingBy(Room::getRoomType));
        List<DashboardResponse.RoomOccupancySummaryDTO> occupancyByType = new ArrayList<>();

        for (RoomType type : RoomType.values()) {
            List<Room> roomsOfThisType = roomsByType.getOrDefault(type, new ArrayList<>());
            long total = roomsOfThisType.size();
            long occupied = roomsOfThisType.stream().filter(r -> r.getOccupancyStatus() == RoomOccupancy.OCCUPIED).count();
            long vacant = total - occupied;

            occupancyByType.add(DashboardResponse.RoomOccupancySummaryDTO.builder()
                    .roomType(type.name())
                    .total(total)
                    .occupied(occupied)
                    .vacant(vacant)
                    .build());
        }

        // Recent Payments
        List<PaymentResponse> recentPayments = paymentService.getAllPayments().stream()
                .limit(7)
                .collect(Collectors.toList());

        // Current Month Pending Rent List
        List<PendingRentResponse> currentMonthPendingList = rentPaymentService.getCurrentMonthPending();

        return DashboardResponse.builder()
                .totalTenants(totalTenants)
                .activeTenants(activeTenants)
                .vacatedTenants(vacatedTenants)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .vacantRooms(vacantRooms)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .currentMonthCollected(Math.round(currentMonthCollected * 100.0) / 100.0)
                .currentMonthPending(Math.round(currentMonthPending * 100.0) / 100.0)
                .overdueAmount(Math.round(totalOverdueAmount * 100.0) / 100.0)
                .totalPenalties(Math.round(totalPenalties * 100.0) / 100.0)
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .paidTenantsCount(paidCount)
                .pendingTenantsCount(pendingCount)
                .overdueTenantsCount(overdueCount)
                .monthlyCollectionTrends(trends)
                .occupancyByType(occupancyByType)
                .recentPayments(recentPayments)
                .currentMonthPendingList(currentMonthPendingList)
                .build();
    }
}
