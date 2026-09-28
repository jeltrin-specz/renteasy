package com.renteasy.service;

import com.renteasy.dto.RoomRequest;
import com.renteasy.dto.RoomResponse;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.RoomOccupancy;
import com.renteasy.entity.enums.TenantStatus;
import com.renteasy.exception.DuplicateResourceException;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        return mapToResponse(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getVacantRooms() {
        return roomRepository.findByOccupancyStatus(RoomOccupancy.VACANT).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getOccupiedRooms() {
        return roomRepository.findByOccupancyStatus(RoomOccupancy.OCCUPIED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new DuplicateResourceException("Room with number '" + request.getRoomNumber() + "' already exists.");
        }

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber().trim())
                .floor(request.getFloor())
                .roomType(request.getRoomType())
                .capacity(request.getCapacity())
                .monthlyRent(request.getMonthlyRent())
                .occupancyStatus(request.getOccupancyStatus() != null ? request.getOccupancyStatus() : RoomOccupancy.VACANT)
                .amenities(request.getAmenities())
                .build();

        Room saved = roomRepository.save(room);
        log.info("Created room {} with ID {}", saved.getRoomNumber(), saved.getRoomId());
        return mapToResponse(saved);
    }

    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        // If room number changed, verify uniqueness
        if (!room.getRoomNumber().equalsIgnoreCase(request.getRoomNumber().trim()) &&
                roomRepository.existsByRoomNumber(request.getRoomNumber().trim())) {
            throw new DuplicateResourceException("Room with number '" + request.getRoomNumber() + "' already exists.");
        }

        room.setRoomNumber(request.getRoomNumber().trim());
        room.setFloor(request.getFloor());
        room.setRoomType(request.getRoomType());
        room.setCapacity(request.getCapacity());
        room.setMonthlyRent(request.getMonthlyRent());
        if (request.getAmenities() != null) {
            room.setAmenities(request.getAmenities());
        }
        if (request.getOccupancyStatus() != null) {
            room.setOccupancyStatus(request.getOccupancyStatus());
        }

        Room updated = roomRepository.save(room);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        if (room.getOccupancyStatus() == RoomOccupancy.OCCUPIED) {
            throw new IllegalStateException("Cannot delete room " + room.getRoomNumber() + " because it is currently occupied.");
        }

        roomRepository.delete(room);
        log.info("Deleted room with ID {}", roomId);
    }

    public RoomResponse mapToResponse(Room room) {
        // Find active tenant in this room if any
        Tenant activeTenant = null;
        if (room.getTenants() != null) {
            activeTenant = room.getTenants().stream()
                    .filter(t -> t.getStatus() == TenantStatus.ACTIVE)
                    .findFirst()
                    .orElse(null);
        }

        return RoomResponse.builder()
                .roomId(room.getRoomId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .roomType(room.getRoomType())
                .capacity(room.getCapacity())
                .monthlyRent(room.getMonthlyRent())
                .occupancyStatus(room.getOccupancyStatus())
                .amenities(room.getAmenities())
                .currentOccupantsCount(activeTenant != null ? 1 : 0)
                .currentTenantName(activeTenant != null ? activeTenant.getFullName() : null)
                .currentTenantId(activeTenant != null ? activeTenant.getTenantId() : null)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
