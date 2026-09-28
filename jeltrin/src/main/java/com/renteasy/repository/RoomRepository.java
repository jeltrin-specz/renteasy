package com.renteasy.repository;

import com.renteasy.entity.Room;
import com.renteasy.entity.enums.RoomOccupancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Room> findByOccupancyStatus(RoomOccupancy occupancyStatus);

    long countByOccupancyStatus(RoomOccupancy occupancyStatus);
}
