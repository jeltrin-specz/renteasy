package com.renteasy.dto;

import com.renteasy.entity.enums.ExpenseCategory;
import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSummaryResponse {

    private Double totalRevenue;
    private Double totalExpenses;
    private Double netProfit;
    private Double profitMarginPercentage;
    private Map<ExpenseCategory, Double> categoryBreakdown;
    private Integer expenseCount;
}
