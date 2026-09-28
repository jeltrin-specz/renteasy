package com.renteasy.dto;

import com.renteasy.entity.enums.RoomOccupancy;
import com.renteasy.entity.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long roomId;
    private String roomNumber;
    private Integer floor;
    private RoomType roomType;
    private Integer capacity;
    private Double monthlyRent;
    private RoomOccupancy occupancyStatus;
    private String amenities;
    private Integer currentOccupantsCount;
    private String currentTenantName;
    private Long currentTenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
