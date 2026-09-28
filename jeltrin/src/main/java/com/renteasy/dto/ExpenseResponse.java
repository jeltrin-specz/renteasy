package com.renteasy.dto;

import com.renteasy.entity.enums.ExpenseCategory;
import com.renteasy.entity.enums.PaymentMethod;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {

    private Long expenseId;
    private String title;
    private Double amount;
    private ExpenseCategory category;
    private LocalDate expenseDate;
    private PaymentMethod paymentMethod;
    private String vendor;
    private String notes;
    private LocalDateTime createdAt;
}
