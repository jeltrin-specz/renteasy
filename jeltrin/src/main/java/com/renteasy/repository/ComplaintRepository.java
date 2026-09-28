package com.renteasy.repository;

import com.renteasy.entity.Complaint;
import com.renteasy.entity.enums.ComplaintCategory;
import com.renteasy.entity.enums.ComplaintPriority;
import com.renteasy.entity.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByTenant_TenantIdOrderByCreatedAtDesc(Long tenantId);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findByCategoryOrderByCreatedAtDesc(ComplaintCategory category);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:priority IS NULL OR c.priority = :priority) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> filterComplaints(
            @Param("status") ComplaintStatus status,
            @Param("category") ComplaintCategory category,
            @Param("priority") ComplaintPriority priority
    );

    long countByStatus(ComplaintStatus status);
}
