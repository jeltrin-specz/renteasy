package com.renteasy.repository;

import com.renteasy.entity.RentPayment;
import com.renteasy.entity.enums.RentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentPaymentRepository extends JpaRepository<RentPayment, Long> {

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant LEFT JOIN FETCH r.room WHERE r.tenant.tenantId = :tenantId AND r.billingMonth = :billingMonth")
    Optional<RentPayment> findByTenantIdAndBillingMonth(@Param("tenantId") Long tenantId, @Param("billingMonth") String billingMonth);

    boolean existsByTenantTenantIdAndBillingMonth(Long tenantId, String billingMonth);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE r.tenant.tenantId = :tenantId ORDER BY r.billingMonth DESC")
    List<RentPayment> findByTenantTenantIdOrderByBillingMonthDesc(@Param("tenantId") Long tenantId);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE r.room.roomId = :roomId ORDER BY r.billingMonth DESC")
    List<RentPayment> findByRoomRoomId(@Param("roomId") Long roomId);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE r.billingMonth = :billingMonth ORDER BY t.fullName ASC")
    List<RentPayment> findByBillingMonth(@Param("billingMonth") String billingMonth);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE r.status = :status ORDER BY r.dueDate ASC")
    List<RentPayment> findByStatus(@Param("status") RentStatus status);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE r.status IN (:statuses) ORDER BY r.dueDate ASC")
    List<RentPayment> findByStatusIn(@Param("statuses") List<RentStatus> statuses);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE r.billingMonth = :billingMonth AND r.status != 'PAID' ORDER BY r.dueDate ASC")
    List<RentPayment> findPendingOrOverdueByBillingMonth(@Param("billingMonth") String billingMonth);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm WHERE (r.status = 'OVERDUE' OR (r.dueDate < :today AND r.balanceAmount > 0)) ORDER BY r.dueDate ASC")
    List<RentPayment> findAllOverdue(@Param("today") LocalDate today);

    @Query("SELECT r FROM RentPayment r LEFT JOIN FETCH r.tenant t LEFT JOIN FETCH r.room rm ORDER BY r.billingMonth DESC, r.dueDate DESC")
    List<RentPayment> findAllWithTenantAndRoom();

    @Query("SELECT COALESCE(SUM(r.amountPaid), 0.0) FROM RentPayment r WHERE r.billingMonth = :billingMonth")
    Double sumAmountPaidByBillingMonth(@Param("billingMonth") String billingMonth);

    @Query("SELECT COALESCE(SUM(r.balanceAmount), 0.0) FROM RentPayment r WHERE r.billingMonth = :billingMonth AND r.status != 'PAID'")
    Double sumPendingAmountByBillingMonth(@Param("billingMonth") String billingMonth);

    @Query("SELECT COALESCE(SUM(r.balanceAmount), 0.0) FROM RentPayment r WHERE r.status = 'OVERDUE' OR (r.dueDate < :today AND r.balanceAmount > 0)")
    Double sumTotalOverdueAmount(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(r.penaltyAmount), 0.0) FROM RentPayment r")
    Double sumTotalPenalties();
}
