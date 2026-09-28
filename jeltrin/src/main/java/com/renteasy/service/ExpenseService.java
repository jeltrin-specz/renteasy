package com.renteasy.service;

import com.renteasy.dto.ExpenseRequest;
import com.renteasy.dto.ExpenseResponse;
import com.renteasy.dto.ExpenseSummaryResponse;
import com.renteasy.entity.Expense;
import com.renteasy.entity.enums.ExpenseCategory;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.ExpenseRepository;
import com.renteasy.repository.RentPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final RentPaymentRepository rentPaymentRepository;

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense expense = Expense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .category(request.getCategory())
                .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now())
                .paymentMethod(request.getPaymentMethod())
                .vendor(request.getVendor())
                .notes(request.getNotes())
                .build();

        Expense saved = expenseRepository.save(expense);
        log.info("Expense created: {} - ₹{}", saved.getTitle(), saved.getAmount());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .sorted((a, b) -> b.getExpenseDate().compareTo(a.getExpenseDate()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByCategory(ExpenseCategory category) {
        return expenseRepository.findByCategoryOrderByExpenseDateDesc(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByDateRange(LocalDate start, LocalDate end) {
        return expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDesc(start, end).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return mapToResponse(expense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : expense.getExpenseDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setVendor(request.getVendor());
        expense.setNotes(request.getNotes());

        return mapToResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
        log.info("Expense {} deleted", id);
    }

    /**
     * Returns total income collected (PAID rent) vs total expenses for net profit analytics.
     */
    @Transactional(readOnly = true)
    public ExpenseSummaryResponse getSummary() {
        Double totalExpenses = expenseRepository.getTotalExpensesSum();
        if (totalExpenses == null) totalExpenses = 0.0;

        // Build per-category breakdown
        List<Object[]> byCategory = expenseRepository.getExpenseSumByCategory();
        Map<String, Double> categoryBreakdown = new HashMap<>();
        for (Object[] row : byCategory) {
            categoryBreakdown.put(row[0].toString(), row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
        }

        // Total rent income from paid payments
        double totalRentIncome = rentPaymentRepository.findAll().stream()
                .filter(r -> r.getStatus() != null && r.getStatus().name().equals("PAID"))
                .mapToDouble(r -> r.getAmountPaid() != null ? r.getAmountPaid() : 0.0)
                .sum();

        double netProfit = totalRentIncome - totalExpenses;

        return ExpenseSummaryResponse.builder()
                .totalExpenses(totalExpenses)
                .totalRentIncome(totalRentIncome)
                .netProfit(netProfit)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    private ExpenseResponse mapToResponse(Expense e) {
        return ExpenseResponse.builder()
                .expenseId(e.getExpenseId())
                .title(e.getTitle())
                .amount(e.getAmount())
                .category(e.getCategory())
                .expenseDate(e.getExpenseDate())
                .paymentMethod(e.getPaymentMethod())
                .vendor(e.getVendor())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
