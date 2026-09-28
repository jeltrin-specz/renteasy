import { useState, useEffect } from 'react';
import {
  getAllRentPayments, getCurrentMonthPending, getOverdueRentPayments,
  getAllPending, generateCurrentMonthRent, recordPayment, getPaymentReceipt
} from '../api';
import { HiOutlineCurrencyRupee, HiOutlineRefresh, HiOutlineExclamation } from 'react-icons/hi';

const formatCurrency = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0';

export default function RentPage({ addToast }) {
  const [tab, setTab] = useState('pending');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'CASH', transactionReference: '', notes: '' });
  const [paying, setPaying] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      let res;
      switch (tab) {
        case 'pending':
          res = await getCurrentMonthPending();
          break;
        case 'overdue':
          res = await getOverdueRentPayments();
          break;
        case 'all-pending':
          res = await getAllPending();
          break;
        case 'all':
          res = await getAllRentPayments(filterMonth || undefined, filterStatus || undefined);
          break;
        default:
          res = await getCurrentMonthPending();
      }
      setData(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load rent data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRent = async () => {
    try {
      const res = await generateCurrentMonthRent();
      addToast(res.data.message || 'Rent generated', 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to generate rent', 'error');
    }
  };

  const openPayModal = (rent) => {
    setSelectedRent(rent);
    const balance = rent.balance ?? rent.balanceAmount ?? 0;
    setPayForm({ amount: balance > 0 ? balance : '', paymentMethod: 'CASH', transactionReference: '', notes: '' });
    setShowPayModal(true);
  };

  const handlePay = async () => {
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    setPaying(true);
    try {
      const payload = {
        rentPaymentId: selectedRent.rentPaymentId,
        tenantId: selectedRent.tenantId,
        amount: parseFloat(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        transactionReference: payForm.transactionReference || null,
        notes: payForm.notes || null,
      };
      const res = await recordPayment(payload);
      addToast(`Payment of ${formatCurrency(payForm.amount)} recorded successfully`, 'success');
      setShowPayModal(false);

      // Show receipt
      try {
        const receiptRes = await getPaymentReceipt(res.data.paymentId);
        setReceipt(receiptRes.data);
        setShowReceipt(true);
      } catch {
        // Receipt is optional
      }

      loadData();
    } catch (err) {
      addToast(err.message || 'Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  // Determine if current view uses PendingRentResponse or RentPaymentResponse
  const isPendingView = ['pending', 'overdue', 'all-pending'].includes(tab);

  return (
    <div className="page-container" id="rent-page">
      {/* Tab Bar */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="tab-bar">
          {[
            { key: 'pending', label: 'Current Month' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'all-pending', label: 'All Pending' },
            { key: 'all', label: 'All Records' },
          ].map((t) => (
            <button key={t.key} className={`tab-item${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-success" onClick={handleGenerateRent} id="generate-rent-btn">
            <HiOutlineRefresh /> Generate This Month
          </button>
        </div>
      </div>

      {/* Filters for 'All' tab */}
      {tab === 'all' && (
        <div className="filter-bar">
          <input className="form-input" type="month" placeholder="Billing Month" value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)} style={{ minWidth: 180 }} />
          <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <button className="btn btn-secondary" onClick={loadData}>Apply</button>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner"></div><span>Loading...</span></div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineExclamation /></div>
          <h3>No Records Found</h3>
          <p>{tab === 'pending' ? 'No pending dues this month. Click "Generate This Month" if rent hasn\'t been created yet.' : 'No records match the selected filters.'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Month</th>
                  <th>Base Rent</th>
                  <th>Penalty</th>
                  <th>Total Due</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const baseRent = isPendingView ? item.monthlyRent : item.baseRent;
                  const penalty = isPendingView ? item.penalty : item.penaltyAmount;
                  const totalDue = item.totalDue;
                  const amountPaid = isPendingView ? item.amountPaid : item.amountPaid;
                  const balance = isPendingView ? item.balance : item.balanceAmount;
                  const canPay = balance > 0 && item.status !== 'PAID';

                  return (
                    <tr key={item.rentPaymentId}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.tenantName}</td>
                      <td>{item.roomNumber}</td>
                      <td style={{ fontWeight: 500 }}>{item.billingMonth}</td>
                      <td>{formatCurrency(baseRent)}</td>
                      <td className="text-danger">{formatCurrency(penalty)}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(totalDue)}</td>
                      <td className="text-success">{formatCurrency(amountPaid)}</td>
                      <td style={{ color: balance > 0 ? 'var(--accent-warning)' : 'var(--accent-success)', fontWeight: 700 }}>
                        {formatCurrency(balance)}
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>
                        {canPay && (
                          <button className="btn btn-primary btn-sm" onClick={() => openPayModal(item)}>
                            <HiOutlineCurrencyRupee /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedRent && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10
              }}>
                <DetailRow label="Tenant" value={selectedRent.tenantName} />
                <DetailRow label="Room" value={selectedRent.roomNumber} />
                <DetailRow label="Month" value={selectedRent.billingMonth} />
                <DetailRow label="Total Due" value={formatCurrency(selectedRent.totalDue)} />
                <DetailRow label="Already Paid" value={formatCurrency(selectedRent.amountPaid)} />
                <DetailRow label="Balance" value={formatCurrency(selectedRent.balance ?? selectedRent.balanceAmount)} highlight />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-input" type="number" min="1" value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                    placeholder="Enter payment amount" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select className="form-select" value={payForm.paymentMethod}
                    onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction Reference</label>
                  <input className="form-input" value={payForm.transactionReference}
                    onChange={(e) => setPayForm({ ...payForm, transactionReference: e.target.value })}
                    placeholder="e.g. UPI Ref No." />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={payForm.notes}
                    onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                    placeholder="Optional remarks" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                {paying ? 'Processing...' : `Pay ${payForm.amount ? formatCurrency(payForm.amount) : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>🧾 Payment Receipt</h3>
              <button className="modal-close" onClick={() => setShowReceipt(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div className="receipt">
                <div className="receipt-header">
                  <h2>RENT-EASY</h2>
                  <p>PG & Hostel Management</p>
                  <p style={{ fontWeight: 600, marginTop: 8, fontSize: '0.85rem', color: '#333' }}>
                    Receipt #{receipt.receiptNumber}
                  </p>
                </div>
                <div className="receipt-row"><span className="label">Tenant</span><span className="value">{receipt.tenantName}</span></div>
                <div className="receipt-row"><span className="label">Phone</span><span className="value">{receipt.tenantPhone}</span></div>
                <div className="receipt-row"><span className="label">Room</span><span className="value">{receipt.roomNumber} (Floor {receipt.floor})</span></div>
                <div className="receipt-row"><span className="label">Billing Month</span><span className="value">{receipt.billingMonth}</span></div>
                <div className="receipt-divider" />
                <div className="receipt-row"><span className="label">Base Rent</span><span className="value">{formatCurrency(receipt.baseRent)}</span></div>
                <div className="receipt-row"><span className="label">Penalty</span><span className="value" style={{ color: '#ef4444' }}>{formatCurrency(receipt.penaltyAmount)}</span></div>
                <div className="receipt-row"><span className="label">Total Due</span><span className="value">{formatCurrency(receipt.totalDue)}</span></div>
                <div className="receipt-divider" />
                <div className="receipt-row"><span className="label">This Payment</span><span className="receipt-total">{formatCurrency(receipt.paymentAmount)}</span></div>
                <div className="receipt-row"><span className="label">Total Paid</span><span className="value">{formatCurrency(receipt.totalAmountPaid)}</span></div>
                <div className="receipt-row"><span className="label">Remaining</span><span className="value" style={{ color: receipt.remainingBalance > 0 ? '#ef4444' : '#10b981' }}>{formatCurrency(receipt.remainingBalance)}</span></div>
                <div className="receipt-divider" />
                <div className="receipt-row"><span className="label">Method</span><span className="value">{(receipt.paymentMethod || '').replace('_', ' ')}</span></div>
                {receipt.transactionReference && <div className="receipt-row"><span className="label">Ref</span><span className="value">{receipt.transactionReference}</span></div>}
                <div className="receipt-row"><span className="label">Date</span><span className="value">{receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleString('en-IN') : '—'}</span></div>
                <div className="receipt-row"><span className="label">Status</span><span className="value">{receipt.status}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => { window.print(); }}>🖨 Print</button>
              <button className="btn btn-secondary" onClick={() => setShowReceipt(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: '0.88rem', fontWeight: highlight ? 700 : 600, color: highlight ? 'var(--accent-warning)' : 'var(--text-primary)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase().replace('_', '-');
  const labels = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue', 'partially-paid': 'Partial' };
  return <span className={`badge badge-${s}`}>{labels[s] || status}</span>;
}
