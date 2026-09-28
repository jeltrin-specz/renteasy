package com.renteasy.repository;

import com.renteasy.entity.Tenant;
import com.renteasy.entity.enums.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    List<Tenant> findByStatus(TenantStatus status);

    long countByStatus(TenantStatus status);

    List<Tenant> findByFullNameContainingIgnoreCase(String name);

    List<Tenant> findByPhoneContaining(String phone);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.room WHERE " +
           "LOWER(t.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "t.phone LIKE CONCAT('%', :query, '%') OR " +
           "(t.room IS NOT NULL AND LOWER(t.room.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Tenant> searchTenants(@Param("query") String query);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.room WHERE t.tenantId = :id")
    Optional<Tenant> findByIdWithRoom(@Param("id") Long id);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.room ORDER BY t.createdAt DESC")
    List<Tenant> findAllWithRoom();

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.room WHERE t.status = 'ACTIVE'")
    List<Tenant> findActiveTenantsWithRoom();
}
