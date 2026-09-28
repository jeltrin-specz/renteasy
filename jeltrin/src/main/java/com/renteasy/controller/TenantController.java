package com.renteasy.controller;

import com.renteasy.dto.TenantRequest;
import com.renteasy.dto.TenantResponse;
import com.renteasy.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "01 Tenants", description = "Endpoints for registering, managing, searching, and vacating tenants")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Get all tenants (both active and vacated) with room and dues summary")
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed tenant profile by ID with full financial metrics")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getTenantById(id));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active tenants")
    public ResponseEntity<List<TenantResponse>> getActiveTenants() {
        return ResponseEntity.ok(tenantService.getActiveTenants());
    }

    @GetMapping("/vacated")
    @Operation(summary = "Get all vacated tenants (historical records)")
    public ResponseEntity<List<TenantResponse>> getVacatedTenants() {
        return ResponseEntity.ok(tenantService.getVacatedTenants());
    }

    @GetMapping("/search")
    @Operation(summary = "Search tenants by name, phone, or room number")
    public ResponseEntity<List<TenantResponse>> searchTenants(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String q) {
        String query = q != null ? q : (name != null ? name : phone);
        return ResponseEntity.ok(tenantService.searchTenants(query));
    }

    @PostMapping
    @Operation(summary = "Register a new tenant, assign room (rejects if occupied), and generate initial rent obligation")
    public ResponseEntity<TenantResponse> registerTenant(@Valid @RequestBody TenantRequest request) {
        TenantResponse registered = tenantService.registerTenant(request);
        return new ResponseEntity<>(registered, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tenant information and room assignment")
    public ResponseEntity<TenantResponse> updateTenant(@PathVariable Long id, @Valid @RequestBody TenantRequest request) {
        return ResponseEntity.ok(tenantService.updateTenant(id, request));
    }

    @PutMapping("/{id}/vacate")
    @Operation(summary = "Vacate a tenant: releases room back to VACANT while preserving all historical payments")
    public ResponseEntity<TenantResponse> vacateTenant(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.vacateTenant(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tenant record")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }
}
