package com.renteasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.renteasy.entity.enums.RentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rent_payment",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_billing_month", columnNames = {"tenant_id", "billing_month"})
    },
    indexes = {
        @Index(name = "idx_billing_month", columnList = "billing_month"),
        @Index(name = "idx_rent_status", columnList = "status"),
        @Index(name = "idx_rent_due_date", columnList = "due_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rent_payment_id")
    private Long rentPaymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "billing_month", nullable = false, length = 20)
    private String billingMonth; // Format: YYYY-MM (e.g. "2026-09")

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "base_rent", nullable = false)
    private Double baseRent;

    @Column(name = "penalty_amount", nullable = false)
    @Builder.Default
    private Double penaltyAmount = 0.0;

    @Column(name = "total_due", nullable = false)
    private Double totalDue;

    @Column(name = "amount_paid", nullable = false)
    @Builder.Default
    private Double amountPaid = 0.0;

    @Column(name = "balance_amount", nullable = false)
    private Double balanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private RentStatus status = RentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "rentPayment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();
}
