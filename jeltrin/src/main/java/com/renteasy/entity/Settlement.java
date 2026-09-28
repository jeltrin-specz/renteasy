package com.renteasy.entity;

import com.renteasy.entity.enums.PaymentMethod;
import com.renteasy.entity.enums.SettlementStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlement", indexes = {
    @Index(name = "idx_settlement_tenant", columnList = "tenant_id"),
    @Index(name = "idx_settlement_date", columnList = "settlement_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "settlement_id")
    private Long settlementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "settlement_date", nullable = false)
    private LocalDate settlementDate;

    @Column(name = "security_deposit", nullable = false)
    private Double securityDeposit;

    @Column(name = "unpaid_rent_amount", nullable = false)
    private Double unpaidRentAmount;

    @Column(name = "unpaid_penalty_amount", nullable = false)
    private Double unpaidPenaltyAmount;

    @Column(name = "damage_deductions", nullable = false)
    private Double damageDeductions;

    @Column(name = "cleaning_deductions", nullable = false)
    private Double cleaningDeductions;

    @Column(name = "other_deductions", nullable = false)
    private Double otherDeductions;

    @Column(name = "total_deductions", nullable = false)
    private Double totalDeductions;

    @Column(name = "net_refund_amount", nullable = false)
    private Double netRefundAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 30)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "notes", length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SettlementStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
