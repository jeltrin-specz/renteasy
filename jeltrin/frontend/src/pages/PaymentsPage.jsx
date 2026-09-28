import { useState, useEffect } from 'react';
import { getAllPayments, getPaymentReceipt } from '../api';
import {
  HiOutlineReceiptRefund,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePrinter,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineExclamation
} from 'react-icons/hi';

const formatCurrency = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0');

export default function PaymentsPage({ addToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPayments();
      setPayments(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to fetch payment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (paymentId) => {
    try {
      setLoadingReceipt(true);
      const res = await getPaymentReceipt(paymentId);
      setReceipt(res.data);
      setShowReceipt(true);
    } catch (err) {
      addToast(err.message || 'Failed to generate receipt', 'error');
    } finally {
      setLoadingReceipt(false);
    }
  };

  // Filter logic
  const filteredPayments = payments.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
      item.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.transactionReference?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.paymentId).includes(search);

    const matchesMethod = methodFilter === '' || item.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Calculate totals
  const totalAmount = filteredPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalTransactions = filteredPayments.length;

  const upiCount = payments.filter((p) => p.paymentMethod === 'UPI').length;
  const cashCount = payments.filter((p) => p.paymentMethod === 'CASH').length;

  return (
    <div className="page-container" id="payments-page">
      {/* Stat Cards */}
      <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon emerald">
            <HiOutlineCurrencyRupee />
          </div>
          <div className="stat-label">Total Revenue Collected</div>
          <div className="stat-value">{formatCurrency(totalAmount)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <HiOutlineDocumentText />
          </div>
          <div className="stat-label">Transactions Count</div>
          <div className="stat-value">{totalTransactions}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <HiOutlineReceiptRefund />
          </div>
          <div className="stat-label">Payment Breakdown</div>
          <div style={{ fontSize: '0.88rem', marginTop: 4, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{cashCount} Cash</span> •{' '}
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{upiCount} UPI / Online</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar mb-4">
        <div className="search-input-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tenant name, room # or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="payments-search-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <HiOutlineFilter style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-select"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{ width: 170 }}
            id="payments-method-filter"
          >
            <option value="">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading payment history...</span>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <HiOutlineExclamation />
          </div>
          <h3>No Payment Records Found</h3>
          <p>
            {search || methodFilter
              ? 'No payments match your current search or filter criteria.'
              : 'No payment transactions have been recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Month</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Ref Number</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((item) => (
                  <tr key={item.paymentId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      #{item.paymentId}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.tenantName}</td>
                    <td>{item.roomNumber || 'N/A'}</td>
                    <td style={{ fontWeight: 500 }}>{item.billingMonth || 'N/A'}</td>
                    <td className="text-success" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td>
                      <span className={`badge badge-${getMethodBadgeClass(item.paymentMethod)}`}>
                        {(item.paymentMethod || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {item.transactionReference || '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.paymentDate ? new Date(item.paymentDate).toLocaleString('en-IN') : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewReceipt(item.paymentId)}
                        disabled={loadingReceipt}
                        title="View Official Receipt"
                      >
                        <HiOutlinePrinter /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>🧾 Rent Payment Receipt</h3>
              <button className="modal-close" onClick={() => setShowReceipt(false)}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div className="receipt">
                <div className="receipt-header">
                  <h2>RENT-EASY</h2>
                  <p>PG & Hostel Room Management</p>
                  <p style={{ fontWeight: 600, marginTop: 8, fontSize: '0.85rem', color: '#333' }}>
                    Receipt #{receipt.receiptNumber}
                  </p>
                </div>
                <div className="receipt-row">
                  <span className="label">Tenant Name</span>
                  <span className="value">{receipt.tenantName}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Phone Number</span>
                  <span className="value">{receipt.tenantPhone}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Room Details</span>
                  <span className="value">
                    {receipt.roomNumber} (Floor {receipt.floor})
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="label">Billing Month</span>
                  <span className="value">{receipt.billingMonth}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row">
                  <span className="label">Base Rent</span>
                  <span className="value">{formatCurrency(receipt.baseRent)}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Late Penalty Fee</span>
                  <span className="value" style={{ color: '#ef4444' }}>
                    {formatCurrency(receipt.penaltyAmount)}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="label">Total Amount Due</span>
                  <span className="value">{formatCurrency(receipt.totalDue)}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row">
                  <span className="label">Amount Paid</span>
                  <span className="receipt-total">{formatCurrency(receipt.paymentAmount)}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Total Cumulative Paid</span>
                  <span className="value">{formatCurrency(receipt.totalAmountPaid)}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">Remaining Balance</span>
                  <span
                    className="value"
                    style={{ color: receipt.remainingBalance > 0 ? '#ef4444' : '#10b981' }}
                  >
                    {formatCurrency(receipt.remainingBalance)}
                  </span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row">
                  <span className="label">Payment Method</span>
                  <span className="value">{(receipt.paymentMethod || '').replace('_', ' ')}</span>
                </div>
                {receipt.transactionReference && (
                  <div className="receipt-row">
                    <span className="label">Ref Number</span>
                    <span className="value">{receipt.transactionReference}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span className="label">Timestamp</span>
                  <span className="value">
                    {receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleString('en-IN') : '—'}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="label">Rent Status</span>
                  <span className="value" style={{ fontWeight: 700, color: '#2563eb' }}>
                    {receipt.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => window.print()}>
                <HiOutlinePrinter /> Print Receipt
              </button>
              <button className="btn btn-secondary" onClick={() => setShowReceipt(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMethodBadgeClass(method) {
  switch (method) {
    case 'CASH':
      return 'paid'; // green/emerald badge
    case 'UPI':
      return 'active'; // blue badge
    case 'CARD':
      return 'purple';
    case 'BANK_TRANSFER':
      return 'secondary';
    default:
      return 'secondary';
  }
}
