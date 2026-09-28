import { useState, useEffect } from 'react';
import {
  getAllTenants, searchTenants, registerTenant, updateTenant, vacateTenant, deleteTenant,
  getVacantRooms, getRentPaymentsByTenant
} from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineLogout, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';

const formatCurrency = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0';

const INITIAL_FORM = {
  fullName: '', phone: '', email: '', address: '', gender: '', dateOfBirth: '',
  idProofType: '', idProofNumber: '', emergencyContactName: '', emergencyContactPhone: '',
  moveInDate: '', moveOutDate: '', monthlyRent: '', securityDeposit: '', roomId: '', status: 'ACTIVE'
};

export default function TenantsPage({ addToast }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [detailTenant, setDetailTenant] = useState(null);
  const [tenantHistory, setTenantHistory] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const res = await getAllTenants();
      setTenants(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load tenants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { loadTenants(); return; }
    try {
      const res = await searchTenants(q);
      setTenants(res.data);
    } catch (err) {
      addToast(err.message || 'Search failed', 'error');
    }
  };

  const openAddModal = async () => {
    setEditingTenant(null);
    setForm(INITIAL_FORM);
    try {
      const res = await getVacantRooms();
      setVacantRooms(res.data);
    } catch { setVacantRooms([]); }
    setShowModal(true);
  };

  const openEditModal = async (tenant) => {
    setEditingTenant(tenant);
    try {
      const res = await getVacantRooms();
      // Include the tenant's current room so it shows in the dropdown
      const currentRoom = tenant.roomId ? { roomId: tenant.roomId, roomNumber: tenant.roomNumber, floor: tenant.floor, roomType: tenant.roomType } : null;
      const rooms = res.data;
      if (currentRoom && !rooms.find(r => r.roomId === currentRoom.roomId)) {
        rooms.unshift(currentRoom);
      }
      setVacantRooms(rooms);
    } catch { setVacantRooms([]); }
    setForm({
      fullName: tenant.fullName || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      address: tenant.address || '',
      gender: tenant.gender || '',
      dateOfBirth: tenant.dateOfBirth || '',
      idProofType: tenant.idProofType || '',
      idProofNumber: tenant.idProofNumber || '',
      emergencyContactName: tenant.emergencyContactName || '',
      emergencyContactPhone: tenant.emergencyContactPhone || '',
      moveInDate: tenant.moveInDate || '',
      moveOutDate: tenant.moveOutDate || '',
      monthlyRent: tenant.monthlyRent || '',
      securityDeposit: tenant.securityDeposit || '',
      roomId: tenant.roomId || '',
      status: tenant.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const openDetailModal = async (tenant) => {
    setDetailTenant(tenant);
    setShowDetailModal(true);
    try {
      const res = await getRentPaymentsByTenant(tenant.tenantId);
      setTenantHistory(res.data);
    } catch {
      setTenantHistory([]);
    }
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.moveInDate || !form.monthlyRent) {
      addToast('Please fill all required fields (Name, Phone, Move-in Date, Monthly Rent)', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        monthlyRent: parseFloat(form.monthlyRent),
        securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : 0,
        roomId: form.roomId ? parseInt(form.roomId) : null,
      };
      if (editingTenant) {
        await updateTenant(editingTenant.tenantId, payload);
        addToast('Tenant updated successfully', 'success');
      } else {
        await registerTenant(payload);
        addToast('Tenant registered successfully', 'success');
      }
      setShowModal(false);
      loadTenants();
    } catch (err) {
      addToast(err.message || 'Failed to save tenant', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVacate = (tenant) => {
    setConfirmAction({
      title: 'Vacate Tenant',
      message: `Are you sure you want to vacate "${tenant.fullName}" from Room ${tenant.roomNumber || 'N/A'}? The room will be released and marked as vacant.`,
      onConfirm: async () => {
        try {
          await vacateTenant(tenant.tenantId);
          addToast(`${tenant.fullName} has been vacated`, 'success');
          loadTenants();
        } catch (err) {
          addToast(err.message || 'Vacate failed', 'error');
        }
        setConfirmAction(null);
      },
    });
  };

  const handleDelete = (tenant) => {
    setConfirmAction({
      title: 'Delete Tenant',
      message: `Permanently delete "${tenant.fullName}"? This action cannot be undone and all associated records will be removed.`,
      danger: true,
      onConfirm: async () => {
        try {
          await deleteTenant(tenant.tenantId);
          addToast('Tenant deleted', 'success');
          loadTenants();
        } catch (err) {
          addToast(err.message || 'Delete failed', 'error');
        }
        setConfirmAction(null);
      },
    });
  };

  const filtered = tenants.filter((t) => {
    if (filter === 'active') return t.status === 'ACTIVE';
    if (filter === 'vacated') return t.status === 'VACATED';
    return true;
  });

  return (
    <div className="page-container" id="tenants-page">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="flex items-center gap-3">
          <div className="tab-bar">
            {['all', 'active', 'vacated'].map((f) => (
              <button key={f} className={`tab-item${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({tenants.filter((t) => f === 'all' ? true : t.status === f.toUpperCase()).length})
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="search-box">
            <HiOutlineSearch className="search-icon" />
            <input placeholder="Search by name, phone..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAddModal} id="add-tenant-btn">
            <HiOutlinePlus /> Add Tenant
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner"></div><span>Loading tenants...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👤</div><h3>No Tenants Found</h3><p>Register your first tenant to get started.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Monthly Rent</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.tenantId}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.fullName}</td>
                    <td>{t.phone}</td>
                    <td>{t.roomNumber ? `${t.roomNumber} (F${t.floor})` : '—'}</td>
                    <td>{formatCurrency(t.monthlyRent)}</td>
                    <td style={{ color: t.totalOutstandingDues > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', fontWeight: 600 }}>
                      {formatCurrency(t.totalOutstandingDues)}
                    </td>
                    <td>
                      <span className={`badge badge-${(t.status || '').toLowerCase()}`}>{t.status}</span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="btn btn-secondary btn-sm btn-icon" title="View Details" onClick={() => openDetailModal(t)}><HiOutlineEye /></button>
                        {t.status === 'ACTIVE' && (
                          <>
                            <button className="btn btn-secondary btn-sm btn-icon" title="Edit" onClick={() => openEditModal(t)}><HiOutlinePencil /></button>
                            <button className="btn btn-secondary btn-sm btn-icon" title="Vacate" onClick={() => handleVacate(t)}><HiOutlineLogout /></button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(t)}><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTenant ? 'Edit Tenant' : 'Register New Tenant'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Ravi Kumar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 9876543210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. ravi@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
                </div>
                <div className="form-group">
                  <label className="form-label">ID Proof Type</label>
                  <select className="form-select" value={form.idProofType} onChange={(e) => setForm({ ...form, idProofType: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Aadhar">Aadhar</option>
                    <option value="PAN">PAN</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Proof Number</label>
                  <input className="form-input" value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} placeholder="e.g. XXXX-XXXX-XXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input className="form-input" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Move-in Date *</label>
                  <input className="form-input" type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Room</label>
                  <select className="form-select" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
                    <option value="">Select Room</option>
                    {vacantRooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        {r.roomNumber} (Floor {r.floor}) — {r.roomType} — ₹{r.monthlyRent}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Rent (₹) *</label>
                  <input className="form-input" type="number" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} placeholder="e.g. 8000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit (₹)</label>
                  <input className="form-input" type="number" value={form.securityDeposit} onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} placeholder="e.g. 10000" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingTenant ? 'Update Tenant' : 'Register Tenant')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailTenant && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tenant Profile — {detailTenant.fullName}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 24 }}>
                <DetailItem label="Full Name" value={detailTenant.fullName} />
                <DetailItem label="Phone" value={detailTenant.phone} />
                <DetailItem label="Email" value={detailTenant.email} />
                <DetailItem label="Gender" value={detailTenant.gender} />
                <DetailItem label="Room" value={detailTenant.roomNumber ? `${detailTenant.roomNumber} (F${detailTenant.floor})` : 'Not Assigned'} />
                <DetailItem label="Room Type" value={detailTenant.roomType} />
                <DetailItem label="Move-in" value={detailTenant.moveInDate} />
                <DetailItem label="Move-out" value={detailTenant.moveOutDate || '—'} />
                <DetailItem label="Monthly Rent" value={formatCurrency(detailTenant.monthlyRent)} />
                <DetailItem label="Security Deposit" value={formatCurrency(detailTenant.securityDeposit)} />
                <DetailItem label="Total Paid" value={formatCurrency(detailTenant.totalAmountPaid)} highlight="success" />
                <DetailItem label="Outstanding" value={formatCurrency(detailTenant.totalOutstandingDues)} highlight={detailTenant.totalOutstandingDues > 0 ? 'danger' : 'success'} />
                <DetailItem label="Total Penalties" value={formatCurrency(detailTenant.totalPenalties)} highlight="danger" />
                <DetailItem label="Unpaid Months" value={detailTenant.unpaidMonthsCount || 0} />
              </div>

              {tenantHistory.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Rent Payment History</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Base Rent</th>
                          <th>Penalty</th>
                          <th>Total Due</th>
                          <th>Paid</th>
                          <th>Balance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenantHistory.map((h) => (
                          <tr key={h.rentPaymentId}>
                            <td style={{ fontWeight: 500 }}>{h.billingMonth}</td>
                            <td>{formatCurrency(h.baseRent)}</td>
                            <td className="text-danger">{formatCurrency(h.penaltyAmount)}</td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(h.totalDue)}</td>
                            <td className="text-success">{formatCurrency(h.amountPaid)}</td>
                            <td className="text-warning" style={{ fontWeight: 600 }}>{formatCurrency(h.balanceAmount)}</td>
                            <td><StatusBadge status={h.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        danger={confirmAction?.danger}
        confirmText={confirmAction?.danger ? 'Delete' : 'Vacate'}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function DetailItem({ label, value, highlight }) {
  const colorMap = { success: 'var(--accent-success)', danger: 'var(--accent-danger)', warning: 'var(--accent-warning)' };
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: highlight ? colorMap[highlight] : 'var(--text-primary)', marginTop: 2 }}>{value || '—'}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase().replace('_', '-');
  const labels = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue', 'partially-paid': 'Partial' };
  return <span className={`badge badge-${s}`}>{labels[s] || status}</span>;
}
