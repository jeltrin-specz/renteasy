import { apiClient } from './client';

// Tenants API
export const tenantsApi = {
  getAll: () => apiClient.get('/tenants').then(res => res.data),
  getById: (id) => apiClient.get(`/tenants/${id}`).then(res => res.data),
  getActive: () => apiClient.get('/tenants/active').then(res => res.data),
  getVacated: () => apiClient.get('/tenants/vacated').then(res => res.data),
  search: (query) => apiClient.get(`/tenants/search?q=${encodeURIComponent(query)}`).then(res => res.data),
  register: (data) => apiClient.post('/tenants', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/tenants/${id}`, data).then(res => res.data),
  vacate: (id) => apiClient.put(`/tenants/${id}/vacate`).then(res => res.data),
  delete: (id) => apiClient.delete(`/tenants/${id}`).then(res => res.data),
};

// Rooms API
export const roomsApi = {
  getAll: () => apiClient.get('/rooms').then(res => res.data),
  getById: (id) => apiClient.get(`/rooms/${id}`).then(res => res.data),
  getVacant: () => apiClient.get('/rooms/vacant').then(res => res.data),
  getOccupied: () => apiClient.get('/rooms/occupied').then(res => res.data),
  create: (data) => apiClient.post('/rooms', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/rooms/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/rooms/${id}`).then(res => res.data),
};

// Rent Payments API (Monthly Rent Obligations)
export const rentPaymentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.billingMonth) query.append('billingMonth', params.billingMonth);
    if (params.status) query.append('status', params.status);
    return apiClient.get(`/rent-payments?${query.toString()}`).then(res => res.data);
  },
  getById: (id) => apiClient.get(`/rent-payments/${id}`).then(res => res.data),
  getByTenant: (tenantId) => apiClient.get(`/rent-payments/tenant/${tenantId}`).then(res => res.data),
  getCurrentMonthPending: () => apiClient.get('/rent-payments/pending/current-month').then(res => res.data),
  getOverdue: () => apiClient.get('/rent-payments/overdue').then(res => res.data),
  getPending: () => apiClient.get('/rent-payments/pending').then(res => res.data),
  create: (data) => apiClient.post('/rent-payments', data).then(res => res.data),
  generateCurrentMonth: () => apiClient.post('/rent-payments/generate-current-month').then(res => res.data),
  updateStatus: (id, status) => apiClient.put(`/rent-payments/${id}/status?status=${status}`).then(res => res.data),
};

// Payments API (Actual Money Transactions)
export const paymentsApi = {
  recordPayment: (data) => apiClient.post('/payments', data).then(res => res.data),
  getAll: () => apiClient.get('/payments').then(res => res.data),
  getById: (id) => apiClient.get(`/payments/${id}`).then(res => res.data),
  getByRentPayment: (rentPaymentId) => apiClient.get(`/payments/rent/${rentPaymentId}`).then(res => res.data),
  getByTenant: (tenantId) => apiClient.get(`/payments/tenant/${tenantId}`).then(res => res.data),
  getReceipt: (paymentId) => apiClient.get(`/payments/${paymentId}/receipt`).then(res => res.data),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard/summary').then(res => res.data),
};
