import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ── Dashboard ──
export const getDashboardSummary = () => api.get('/dashboard/summary');

// ── Tenants ──
export const getAllTenants = () => api.get('/tenants');
export const getActiveTenants = () => api.get('/tenants/active');
export const getVacatedTenants = () => api.get('/tenants/vacated');
export const getTenantById = (id) => api.get(`/tenants/${id}`);
export const searchTenants = (q) => api.get('/tenants/search', { params: { q } });
export const registerTenant = (data) => api.post('/tenants', data);
export const updateTenant = (id, data) => api.put(`/tenants/${id}`, data);
export const vacateTenant = (id) => api.put(`/tenants/${id}/vacate`);
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);

// ── Rooms ──
export const getAllRooms = () => api.get('/rooms');
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const getVacantRooms = () => api.get('/rooms/vacant');
export const getOccupiedRooms = () => api.get('/rooms/occupied');
export const createRoom = (data) => api.post('/rooms', data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// ── Rent Payments ──
export const getAllRentPayments = (billingMonth, status) =>
  api.get('/rent-payments', { params: { billingMonth, status } });
export const getRentPaymentById = (id) => api.get(`/rent-payments/${id}`);
export const getRentPaymentsByTenant = (tenantId) => api.get(`/rent-payments/tenant/${tenantId}`);
export const getCurrentMonthPending = () => api.get('/rent-payments/pending/current-month');
export const getOverdueRentPayments = () => api.get('/rent-payments/overdue');
export const getAllPending = () => api.get('/rent-payments/pending');
export const createRentPayment = (data) => api.post('/rent-payments', data);
export const generateCurrentMonthRent = () => api.post('/rent-payments/generate-current-month');

// ── Payments ──
export const recordPayment = (data) => api.post('/payments', data);
export const getAllPayments = () => api.get('/payments');
export const getPaymentById = (id) => api.get(`/payments/${id}`);
export const getPaymentsByRentPayment = (rentPaymentId) => api.get(`/payments/rent/${rentPaymentId}`);
export const getPaymentsByTenant = (tenantId) => api.get(`/payments/tenant/${tenantId}`);
export const getPaymentReceipt = (id) => api.get(`/payments/${id}/receipt`);

// ── Complaints ──
export const getAllComplaints = (status, category, priority) =>
  api.get('/complaints', { params: { status, category, priority } });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const getComplaintsByTenant = (tenantId) => api.get(`/complaints/tenant/${tenantId}`);
export const createComplaint = (data) => api.post('/complaints', data);
export const updateComplaintStatus = (id, data) => api.put(`/complaints/${id}/status`, data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);

export default api;

