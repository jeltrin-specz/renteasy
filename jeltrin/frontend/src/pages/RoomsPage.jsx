import { useState, useEffect } from 'react';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const formatCurrency = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0';

const INITIAL_FORM = {
  roomNumber: '', floor: '', roomType: 'SINGLE', capacity: '', monthlyRent: '', amenities: '', occupancyStatus: ''
};

export default function RoomsPage({ addToast }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => { loadRooms(); }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await getAllRooms();
      setRooms(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber || '',
      floor: room.floor ?? '',
      roomType: room.roomType || 'SINGLE',
      capacity: room.capacity ?? '',
      monthlyRent: room.monthlyRent ?? '',
      amenities: room.amenities || '',
      occupancyStatus: room.occupancyStatus || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.roomNumber || form.floor === '' || !form.roomType || !form.capacity || !form.monthlyRent) {
      addToast('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        roomNumber: form.roomNumber,
        floor: parseInt(form.floor),
        roomType: form.roomType,
        capacity: parseInt(form.capacity),
        monthlyRent: parseFloat(form.monthlyRent),
        amenities: form.amenities || null,
      };
      if (editingRoom) {
        await updateRoom(editingRoom.roomId, payload);
        addToast('Room updated successfully', 'success');
      } else {
        await createRoom(payload);
        addToast('Room created successfully', 'success');
      }
      setShowModal(false);
      loadRooms();
    } catch (err) {
      addToast(err.message || 'Failed to save room', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (room) => {
    if (room.occupancyStatus === 'OCCUPIED') {
      addToast('Cannot delete an occupied room. Vacate the tenant first.', 'error');
      return;
    }
    setConfirmAction({
      title: 'Delete Room',
      message: `Permanently delete room "${room.roomNumber}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteRoom(room.roomId);
          addToast('Room deleted', 'success');
          loadRooms();
        } catch (err) {
          addToast(err.message || 'Delete failed', 'error');
        }
        setConfirmAction(null);
      },
    });
  };

  const filtered = rooms.filter((r) => {
    if (filter === 'vacant') return r.occupancyStatus === 'VACANT';
    if (filter === 'occupied') return r.occupancyStatus === 'OCCUPIED';
    return true;
  });

  const vacantCount = rooms.filter((r) => r.occupancyStatus === 'VACANT').length;
  const occupiedCount = rooms.filter((r) => r.occupancyStatus === 'OCCUPIED').length;

  return (
    <div className="page-container" id="rooms-page">
      {/* Stats */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-label">Total Rooms</div>
          <div className="metric-value">{rooms.length}</div>
        </div>
        <div className="metric-card" style={{ '--metric-accent': 'var(--accent-success)' }}>
          <div className="metric-label">Vacant</div>
          <div className="metric-value text-success">{vacantCount}</div>
        </div>
        <div className="metric-card" style={{ '--metric-accent': 'var(--accent-info)' }}>
          <div className="metric-label">Occupied</div>
          <div className="metric-value text-info">{occupiedCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="tab-bar">
          {[
            { key: 'all', label: `All (${rooms.length})` },
            { key: 'vacant', label: `Vacant (${vacantCount})` },
            { key: 'occupied', label: `Occupied (${occupiedCount})` },
          ].map((f) => (
            <button key={f.key} className={`tab-item${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="add-room-btn">
          <HiOutlinePlus /> Add Room
        </button>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="loading-container"><div className="spinner"></div><span>Loading rooms...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏠</div><h3>No Rooms Found</h3><p>Create your first room to get started.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((room) => (
            <div key={room.roomId} className="card" style={{ overflow: 'visible' }}>
              <div className="card-body" style={{ padding: 20 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                      Room {room.roomNumber}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Floor {room.floor}</span>
                  </div>
                  <span className={`badge badge-${(room.occupancyStatus || '').toLowerCase()}`}>
                    {room.occupancyStatus}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 16 }}>
                  <RoomDetail label="Type" value={room.roomType} />
                  <RoomDetail label="Capacity" value={room.capacity} />
                  <RoomDetail label="Monthly Rent" value={formatCurrency(room.monthlyRent)} />
                  <RoomDetail label="Occupants" value={room.currentOccupantsCount ?? 0} />
                </div>

                {room.currentTenantName && (
                  <div style={{
                    padding: '10px 14px', background: 'var(--accent-info-bg)', borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem', color: 'var(--accent-info)', marginBottom: 14, fontWeight: 500
                  }}>
                    👤 {room.currentTenantName}
                  </div>
                )}

                {room.amenities && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    🏷️ {room.amenities}
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(room)} style={{ flex: 1 }}>
                    <HiOutlinePencil /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(room)}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Room Number *</label>
                  <input className="form-input" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. A-101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor *</label>
                  <input className="form-input" type="number" min="0" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="e.g. 1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Type *</label>
                  <select className="form-select" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="TRIPLE">Triple</option>
                    <option value="DORMITORY">Dormitory</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input className="form-input" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 2" />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Rent (₹) *</label>
                  <input className="form-input" type="number" min="0" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} placeholder="e.g. 8000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Amenities</label>
                  <input className="form-input" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="e.g. WiFi, AC, Laundry" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingRoom ? 'Update Room' : 'Create Room')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        danger
        confirmText="Delete"
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function RoomDetail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
    </div>
  );
}
