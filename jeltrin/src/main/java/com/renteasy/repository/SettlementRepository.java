package com.renteasy.repository;

import com.renteasy.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByTenant_TenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Settlement> findFirstByTenant_TenantIdOrderByCreatedAtDesc(Long tenantId);
}
