import { useState, useEffect } from 'react';
import {
  getAllComplaints,
  getActiveTenants,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint
} from '../api';
import ConfirmModal from '../components/ConfirmModal';
import {
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineViewBoards,
  HiOutlineViewList
} from 'react-icons/hi';

export default function ComplaintsPage({ addToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    tenantId: '',
    title: '',
    description: '',
    category: 'PLUMBING',
    priority: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);

  // Update Status Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: 'OPEN',
    assignedTo: '',
    adminNotes: '',
  });

  // Delete Modal
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchComplaints();
    fetchActiveTenants();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getAllComplaints(
        statusFilter || undefined,
        categoryFilter || undefined,
        priorityFilter || undefined
      );
      setComplaints(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load maintenance complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTenants = async () => {
    try {
      const res = await getActiveTenants();
      setTenants(res.data);
    } catch (err) {
      console.error('Failed to load active tenants for dropdown:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.tenantId || !createForm.title) {
      addToast('Please select a tenant and enter a complaint title', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await createComplaint({
        tenantId: Number(createForm.tenantId),
        title: createForm.title,
        description: createForm.description,
        category: createForm.category,
        priority: createForm.priority,
      });

      addToast('Maintenance complaint submitted successfully', 'success');
      setShowCreateModal(false);
      setCreateForm({ tenantId: '', title: '', description: '', category: 'PLUMBING', priority: 'MEDIUM' });
      fetchComplaints();
    } catch (err) {
      addToast(err.message || 'Failed to raise complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateModal = (c) => {
    setSelectedComplaint(c);
    setUpdateForm({
      status: c.status,
      assignedTo: c.assignedTo || '',
      adminNotes: c.adminNotes || '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateComplaintStatus(selectedComplaint.complaintId, updateForm);
      addToast(`Ticket #${selectedComplaint.complaintId} updated to ${updateForm.status}`, 'success');
      setShowUpdateModal(false);
      fetchComplaints();
    } catch (err) {
      addToast(err.message || 'Failed to update ticket status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComplaint(deleteId);
      addToast('Complaint ticket deleted', 'info');
      setDeleteId(null);
      fetchComplaints();
    } catch (err) {
      addToast(err.message || 'Failed to delete complaint ticket', 'error');
    }
  };

  // Filtered list
  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      search === '' ||
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.tenantName?.toLowerCase().includes(q) ||
      c.roomNumber?.toLowerCase().includes(q) ||
      c.assignedTo?.toLowerCase().includes(q) ||
      String(c.complaintId).includes(q)
    );
  });

  // KPI calculations
  const totalCount = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="page-container" id="complaints-page">
      {/* Stat Cards */}
      <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon primary">
            <HiOutlineCog />
          </div>
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{totalCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <HiOutlineClock />
          </div>
          <div className="stat-label">Open Issues</div>
          <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>
            {openCount}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <HiOutlineExclamationCircle />
          </div>
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
            {inProgressCount}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-label">Resolved</div>
          <div className="stat-value text-success">{resolvedCount}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="filter-bar" style={{ margin: 0, flex: 1 }}>
          <div className="search-input-wrapper">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search title, tenant, room, assigned tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="complaint-search-input"
            />
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 150 }}
          >
            <option value="">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="WIFI">Wi-Fi / Network</option>
            <option value="CLEANING">Cleaning</option>
            <option value="FURNITURE">Furniture</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="tab-bar" style={{ padding: 3 }}>
            <button
              className={`tab-item ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <HiOutlineViewBoards style={{ fontSize: '1.1rem' }} /> Kanban
            </button>
            <button
              className={`tab-item ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Table List View"
            >
              <HiOutlineViewList style={{ fontSize: '1.1rem' }} /> List
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            id="raise-complaint-btn"
          >
            <HiOutlinePlus /> Raise Complaint
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading maintenance tickets...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <HiOutlineCog />
          </div>
          <h3>No Maintenance Tickets Found</h3>
          <p>
            {search || statusFilter || categoryFilter || priorityFilter
              ? 'No tickets match your active filters.'
              : 'All maintenance requests have been resolved or none have been logged yet.'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <KanbanColumn
            title="Open Tickets"
            color="var(--accent-warning)"
            count={filtered.filter((c) => c.status === 'OPEN').length}
            items={filtered.filter((c) => c.status === 'OPEN')}
            onUpdateStatus={openUpdateModal}
            onDelete={(id) => setDeleteId(id)}
          />

          <KanbanColumn
            title="In Progress"
            color="var(--accent-primary)"
            count={filtered.filter((c) => c.status === 'IN_PROGRESS').length}
            items={filtered.filter((c) => c.status === 'IN_PROGRESS')}
            onUpdateStatus={openUpdateModal}
            onDelete={(id) => setDeleteId(id)}
          />

          <KanbanColumn
            title="Resolved"
            color="var(--accent-emerald)"
            count={filtered.filter((c) => c.status === 'RESOLVED').length}
            items={filtered.filter((c) => c.status === 'RESOLVED')}
            onUpdateStatus={openUpdateModal}
            onDelete={(id) => setDeleteId(id)}
          />
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Title & Description</th>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Tech</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.complaintId}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                      #{item.complaintId}
                    </td>
                    <td>
                      <span className="badge badge-secondary">{item.category}</span>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.description || 'No description provided'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.tenantName}</td>
                    <td>
                      <span className="badge badge-primary">{item.roomNumber}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {item.assignedTo || 'Unassigned'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openUpdateModal(item)}
                          title="Update Status / Assign"
                        >
                          <HiOutlinePencilAlt /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(item.complaintId)}
                          title="Delete Ticket"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE COMPLAINT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🛠️ Raise Maintenance Complaint</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Select Tenant *</label>
                  <select
                    className="form-select"
                    value={createForm.tenantId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, tenantId: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose Active Tenant --</option>
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.fullName} ({t.roomNumber ? `Room ${t.roomNumber}` : 'No Room'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Issue Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Water leak in bathroom / AC not cooling"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-grid mb-3">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={createForm.category}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, category: e.target.value })
                      }
                    >
                      <option value="PLUMBING">Plumbing</option>
                      <option value="ELECTRICAL">Electrical</option>
                      <option value="WIFI">Wi-Fi / Network</option>
                      <option value="CLEANING">Cleaning & Housekeeping</option>
                      <option value="FURNITURE">Furniture</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level *</label>
                    <select
                      className="form-select"
                      value={createForm.priority}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, priority: e.target.value })
                      }
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent (Emergency)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Issue Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Provide details about the problem..."
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS / ASSIGN MODAL */}
      {showUpdateModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Manage Ticket #{selectedComplaint.complaintId} — {selectedComplaint.title}
              </h3>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    padding: 14,
                    marginBottom: 16,
                    fontSize: '0.88rem',
                  }}
                >
                  <div>
                    <strong>Tenant:</strong> {selectedComplaint.tenantName} (Room{' '}
                    {selectedComplaint.roomNumber})
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                    <strong>Details:</strong> {selectedComplaint.description || 'None'}
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Ticket Status *</label>
                  <select
                    className="form-select"
                    value={updateForm.status}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, status: e.target.value })
                    }
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Assign Technician / Staff</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Suresh Electrician / Housekeeping Team"
                    value={updateForm.assignedTo}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, assignedTo: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Remarks / Resolution Notes</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Add resolution details or updates..."
                    value={updateForm.adminNotes}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, adminNotes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmModal
          title="Delete Complaint Ticket"
          message={`Are you sure you want to delete maintenance ticket #${deleteId}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

// Kanban Column Subcomponent
function KanbanColumn({ title, color, count, items, onUpdateStatus, onDelete }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: 16,
        minHeight: 350,
      }}
    >
      <div
        className="flex items-center justify-between mb-3"
        style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: color,
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</span>
        </div>
        <span className="badge badge-secondary" style={{ borderRadius: 12 }}>
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '24px 0',
            }}
          >
            No tickets
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.complaintId}
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                borderLeft: `4px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  #{item.complaintId} • {item.category}
                </span>
                <PriorityBadge priority={item.priority} />
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {item.title}
              </div>

              {item.description && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </div>
              )}

              <div
                className="flex items-center justify-between"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  paddingTop: 6,
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <div>
                  👤 <strong>{item.tenantName}</strong> (Room {item.roomNumber})
                </div>
              </div>

              {item.assignedTo && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                  🔧 {item.assignedTo}
                </div>
              )}

              <div className="flex items-center justify-end gap-2" style={{ marginTop: 4 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onUpdateStatus(item)}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  <HiOutlinePencilAlt /> Update
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(item.complaintId)}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const p = (priority || '').toUpperCase();
  const colors = {
    URGENT: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: '🔥 Urgent' },
    HIGH: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'High' },
    MEDIUM: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Medium' },
    LOW: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', label: 'Low' },
  };
  const conf = colors[p] || colors.MEDIUM;
  return (
    <span
      style={{
        background: conf.bg,
        color: conf.color,
        fontSize: '0.72rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 6,
        textTransform: 'uppercase',
      }}
    >
      {conf.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  const badges = {
    OPEN: 'badge-warning',
    IN_PROGRESS: 'badge-active',
    RESOLVED: 'badge-paid',
    REJECTED: 'badge-vacated',
  };
  return <span className={`badge ${badges[s] || 'badge-secondary'}`}>{s.replace('_', ' ')}</span>;
}
