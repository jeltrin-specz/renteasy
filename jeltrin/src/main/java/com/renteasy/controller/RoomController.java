package com.renteasy.controller;

import com.renteasy.dto.RoomRequest;
import com.renteasy.dto.RoomResponse;
import com.renteasy.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "02 Rooms", description = "Endpoints for managing hostel/PG rooms and occupancy")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Get all rooms with current occupancy and assigned tenant details")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get room details by ID")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/vacant")
    @Operation(summary = "Get list of currently vacant rooms available for assignment")
    public ResponseEntity<List<RoomResponse>> getVacantRooms() {
        return ResponseEntity.ok(roomService.getVacantRooms());
    }

    @GetMapping("/occupied")
    @Operation(summary = "Get list of currently occupied rooms")
    public ResponseEntity<List<RoomResponse>> getOccupiedRooms() {
        return ResponseEntity.ok(roomService.getOccupiedRooms());
    }

    @PostMapping
    @Operation(summary = "Create a new room")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomResponse created = roomService.createRoom(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing room")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a vacant room")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
