package com.renteasy.repository;

import com.renteasy.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.tenant t LEFT JOIN FETCH p.rentPayment rp LEFT JOIN FETCH rp.room ORDER BY p.paymentDate DESC")
    List<Payment> findAllWithDetails();

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.tenant t LEFT JOIN FETCH p.rentPayment rp LEFT JOIN FETCH rp.room WHERE p.rentPayment.rentPaymentId = :rentPaymentId ORDER BY p.paymentDate DESC")
    List<Payment> findByRentPaymentId(@Param("rentPaymentId") Long rentPaymentId);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.tenant t LEFT JOIN FETCH p.rentPayment rp LEFT JOIN FETCH rp.room WHERE p.tenant.tenantId = :tenantId ORDER BY p.paymentDate DESC")
    List<Payment> findByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p")
    Double sumTotalPayments();
}
