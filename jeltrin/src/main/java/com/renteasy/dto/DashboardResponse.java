package com.renteasy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    // Core KPIs
    private Long totalTenants;
    private Long activeTenants;
    private Long vacatedTenants;
    private Long totalRooms;
    private Long occupiedRooms;
    private Long vacantRooms;
    private Double occupancyRate;

    // Financial KPIs
    private Double currentMonthCollected;
    private Double currentMonthPending;
    private Double overdueAmount;
    private Double totalPenalties;
    private Double totalRevenue;

    // Counts
    private Long pendingTenantsCount;
    private Long overdueTenantsCount;
    private Long paidTenantsCount;

    // Chart Data structures
    private List<MonthlyTrendDTO> monthlyCollectionTrends;
    private List<RoomOccupancySummaryDTO> occupancyByType;
    private List<PaymentResponse> recentPayments;
    private List<PendingRentResponse> currentMonthPendingList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendDTO {
        private String month; // e.g. "Sep 2026"
        private Double collected;
        private Double pending;
        private Double overdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomOccupancySummaryDTO {
        private String roomType;
        private Long total;
        private Long occupied;
        private Long vacant;
    }
}
