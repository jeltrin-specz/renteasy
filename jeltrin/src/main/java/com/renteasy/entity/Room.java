package com.renteasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.renteasy.entity.enums.RoomOccupancy;
import com.renteasy.entity.enums.RoomType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room", indexes = {
    @Index(name = "idx_room_number", columnList = "room_number"),
    @Index(name = "idx_occupancy_status", columnList = "occupancy_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "room_number", nullable = false, unique = true, length = 50)
    private String roomNumber;

    @Column(name = "floor", nullable = false)
    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 30)
    private RoomType roomType;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "monthly_rent", nullable = false)
    private Double monthlyRent;

    @Enumerated(EnumType.STRING)
    @Column(name = "occupancy_status", nullable = false, length = 30)
    @Builder.Default
    private RoomOccupancy occupancyStatus = RoomOccupancy.VACANT;

    @Column(name = "amenities", length = 500)
    private String amenities;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Tenant> tenants = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<RentPayment> rentPayments = new ArrayList<>();
}
