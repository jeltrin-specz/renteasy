package com.renteasy.dto;

import com.renteasy.entity.enums.ExpenseCategory;
import com.renteasy.entity.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150)
    private String title;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be positive")
    private Double amount;

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    private LocalDate expenseDate;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Size(max = 100)
    private String vendor;

    @Size(max = 500)
    private String notes;
}
