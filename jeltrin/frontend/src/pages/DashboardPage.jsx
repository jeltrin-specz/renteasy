import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api';
import {
  HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineCurrencyRupee,
  HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineClock
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const formatCurrency = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage({ addToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary();
      setData(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-container"><div className="spinner"></div><span>Loading dashboard...</span></div></div>;
  }

  if (!data) {
    return <div className="page-container"><div className="empty-state"><div className="empty-icon">📊</div><h3>Dashboard Unavailable</h3><p>Could not load dashboard data. Make sure the backend is running.</p></div></div>;
  }

  const trendData = (data.monthlyCollectionTrends || []).map((t) => ({
    month: t.month,
    Collected: t.collected || 0,
    Pending: t.pending || 0,
    Overdue: t.overdue || 0,
  }));

  const occupancyData = (data.occupancyByType || []).map((o) => ({
    name: o.roomType,
    occupied: o.occupied || 0,
    vacant: o.vacant || 0,
  }));

  const occupancyPieData = [
    { name: 'Occupied', value: data.occupiedRooms || 0 },
    { name: 'Vacant', value: data.vacantRooms || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="page-container" id="dashboard-page">
      {/* KPI Metrics */}
      <div className="metrics-grid">
        <MetricCard icon={<HiOutlineUserGroup />} label="Active Tenants" value={data.activeTenants || 0}
          sub={`${data.vacatedTenants || 0} vacated`} accent="var(--accent-primary)" />
        <MetricCard icon={<HiOutlineOfficeBuilding />} label="Rooms Occupied" value={`${data.occupiedRooms || 0} / ${data.totalRooms || 0}`}
          sub={`${(data.occupancyRate || 0).toFixed(0)}% occupancy`} accent="var(--accent-info)" />
        <MetricCard icon={<HiOutlineCurrencyRupee />} label="Collected This Month" value={formatCurrency(data.currentMonthCollected)}
          sub="Current billing cycle" accent="var(--accent-success)" />
        <MetricCard icon={<HiOutlineClock />} label="Pending This Month" value={formatCurrency(data.currentMonthPending)}
          sub={`${data.pendingTenantsCount || 0} tenants pending`} accent="var(--accent-warning)" />
        <MetricCard icon={<HiOutlineExclamation />} label="Total Overdue" value={formatCurrency(data.overdueAmount)}
          sub={`${data.overdueTenantsCount || 0} tenants overdue`} accent="var(--accent-danger)" />
        <MetricCard icon={<HiOutlineCheckCircle />} label="Total Revenue" value={formatCurrency(data.totalRevenue)}
          sub={`Penalties: ${formatCurrency(data.totalPenalties)}`} accent="var(--accent-success)" />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Monthly Collection Trend */}
        {trendData.length > 0 && (
          <div className="chart-card">
            <h3>Monthly Collection Trends</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e2231', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Room Occupancy Pie */}
        {occupancyPieData.length > 0 && (
          <div className="chart-card">
            <h3>Room Occupancy Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={100}
                  dataKey="value"
                  stroke="none"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {occupancyPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e2231', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      {data.recentPayments && data.recentPayments.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3>Recent Payments</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.slice(0, 8).map((p) => (
                  <tr key={p.paymentId}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.tenantName}</td>
                    <td>{p.roomNumber}</td>
                    <td>{p.billingMonth}</td>
                    <td className="text-success" style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                    <td><span className="badge badge-paid">{(p.paymentMethod || '').replace('_', ' ')}</span></td>
                    <td className="text-muted">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Current Month Pending */}
      {data.currentMonthPendingList && data.currentMonthPendingList.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3>⚠ Current Month — Pending Dues</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Rent</th>
                  <th>Penalty</th>
                  <th>Total Due</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.currentMonthPendingList.map((p) => (
                  <tr key={p.rentPaymentId}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.tenantName}</td>
                    <td>{p.roomNumber}</td>
                    <td>{formatCurrency(p.monthlyRent)}</td>
                    <td className="text-danger">{formatCurrency(p.penalty)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.totalDue)}</td>
                    <td className="text-success">{formatCurrency(p.amountPaid)}</td>
                    <td className="text-warning" style={{ fontWeight: 700 }}>{formatCurrency(p.balance)}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, accent }) {
  return (
    <div className="metric-card" style={{ '--metric-accent': accent }}>
      <div className="metric-icon" style={{ background: `${accent}18`, color: accent }}>
        {icon}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase().replace('_', '-');
  const labels = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue', 'partially-paid': 'Partial' };
  return <span className={`badge badge-${s}`}>{labels[s] || status}</span>;
}
