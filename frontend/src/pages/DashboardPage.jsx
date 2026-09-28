import React from 'react';
import {
  Users,
  DoorClosed,
  TrendingUp,
  AlertOctagon,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Building
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage({
  dashboardData,
  isLoading,
  onRecordPaymentForRent,
  onViewReceipt,
  onNavigateToTab
}) {
  if (isLoading || !dashboardData) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-[#E6E0D6] rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[#E6E0D6] rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#E6E0D6] rounded-xl"></div>
          <div className="h-80 bg-[#E6E0D6] rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Distribution chart data
  const statusPieData = [
    { name: 'Paid', value: dashboardData.paidTenantsCount || 0, color: '#657A52' },
    { name: 'Pending', value: dashboardData.pendingTenantsCount || 0, color: '#D39A45' },
    { name: 'Overdue', value: dashboardData.overdueTenantsCount || 0, color: '#B6473F' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title & Quick Refresh info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171613] font-['Outfit'] tracking-tight">
            Hostel Operations & Financial Overview
          </h2>
          <p className="text-xs text-[#716C63] mt-1 font-medium">
            Real-time synchronization across rooms, tenant obligations, daily penalties, and payment collection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF4EB] text-[#4F623F] border border-[#D5E2CD]">
            <span className="w-2 h-2 rounded-full bg-[#657A52] animate-ping"></span>
            Live Database Sync
          </span>
        </div>
      </div>

      {/* Top KPI Cards (4 Main Financial & Capacity Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Collected This Month */}
        <MetricCard
          title="Collected This Month"
          value={`₹${Number(dashboardData.currentMonthCollected || 0).toLocaleString('en-IN')}`}
          subtitle={`${dashboardData.paidTenantsCount || 0} active tenants cleared`}
          icon={TrendingUp}
          variant="sage"
          trend={{ positive: true, text: 'Current Month', label: 'Cash flow' }}
        />

        {/* Current Month Pending */}
        <MetricCard
          title="Current Month Pending"
          value={`₹${Number(dashboardData.currentMonthPending || 0).toLocaleString('en-IN')}`}
          subtitle={`${dashboardData.pendingTenantsCount || 0} pending dues`}
          icon={Clock}
          variant="amber"
          trend={{ positive: false, text: 'Due Soon', label: 'Awaiting payment' }}
        />

        {/* Total Overdue Rent */}
        <MetricCard
          title="Total Overdue Amount"
          value={`₹${Number(dashboardData.overdueAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`Includes ₹${Number(dashboardData.totalPenalties || 0).toLocaleString('en-IN')} penalties`}
          icon={AlertOctagon}
          variant="danger"
          trend={{ positive: false, text: `${dashboardData.overdueTenantsCount || 0} tenants`, label: 'Need follow-up' }}
        />

        {/* Room Occupancy */}
        <MetricCard
          title="Room Occupancy"
          value={`${dashboardData.occupiedRooms || 0} / ${dashboardData.totalRooms || 0}`}
          subtitle={`${dashboardData.vacantRooms || 0} vacant rooms ready`}
          icon={DoorClosed}
          variant="terracotta"
          trend={{ positive: true, text: `${dashboardData.occupancyRate || 0}%`, label: 'Occupancy rate' }}
        />

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Collection Trends (Bar / Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#171613] font-['Outfit']">
                Monthly Revenue & Collection Trend
              </h3>
              <p className="text-xs text-[#716C63]">6-Month comparison of collected rent vs pending dues</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#657A52]">
                <span className="w-3 h-3 rounded bg-[#657A52]"></span> Collected
              </span>
              <span className="flex items-center gap-1.5 text-[#D39A45]">
                <span className="w-3 h-3 rounded bg-[#D39A45]"></span> Pending
              </span>
              <span className="flex items-center gap-1.5 text-[#B6473F]">
                <span className="w-3 h-3 rounded bg-[#B6473F]"></span> Overdue
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.monthlyCollectionTrends || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
                <XAxis dataKey="month" stroke="#9E998F" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#9E998F"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#171613',
                    borderRadius: '10px',
                    color: '#FAF7F2',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="collected" name="Collected" fill="#657A52" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#D39A45" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#B6473F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution & Room Type Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#171613] font-['Outfit'] mb-1">
              Current Month Status
            </h3>
            <p className="text-xs text-[#716C63] mb-4">Payment compliance ratio</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171613',
                      borderRadius: '8px',
                      color: '#FAF7F2',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Type Capacity Summary */}
          <div className="mt-4 pt-4 border-t border-[#F0EBE3] space-y-2 text-xs">
            <p className="font-bold text-[#24231F] uppercase text-[10px] tracking-wider mb-2">
              Occupancy by Room Type
            </p>
            {(dashboardData.occupancyByType || []).map((ot, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <span className="font-medium text-[#716C63]">{ot.roomType}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-semibold text-[#171613]">{ot.occupied} Occ.</span>
                  <span className="text-[#9E998F]">/</span>
                  <span className="text-[#657A52] font-semibold">{ot.vacant} Vac.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Critical Section: "Current Month Pending Rent" Action Table */}
      <div className="bg-white rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)] overflow-hidden">
        <div className="p-6 border-b border-[#E6E0D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#171613] font-['Outfit']">
                Current Month Pending Rent
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#FDF0EF] text-[#B6473F] border border-[#F9CBC8]">
                {(dashboardData.currentMonthPendingList || []).length} Actions Required
              </span>
            </div>
            <p className="text-xs text-[#716C63] mt-1">
              Tenants who have not completed payment for the current billing cycle. Click 'Record Payment' to settle immediately.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('rent')}
            className="text-xs font-semibold text-[#C65D3A] hover:text-[#B04F2E] flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            View all monthly obligations <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#716C63] font-bold uppercase text-[11px] border-b border-[#E6E0D6]">
              <tr>
                <th className="p-4">Tenant Name</th>
                <th className="p-4">Room</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Base Rent</th>
                <th className="p-4">Penalty</th>
                <th className="p-4">Total Due</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6]">
              {(!dashboardData.currentMonthPendingList || dashboardData.currentMonthPendingList.length === 0) ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-[#9E998F]">
                    <CheckCircle2 className="w-8 h-8 text-[#657A52] mx-auto mb-2 opacity-80" />
                    All active tenants have completed payment for the current month!
                  </td>
                </tr>
              ) : (
                dashboardData.currentMonthPendingList.map((item) => (
                  <tr key={item.rentPaymentId} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-4 font-bold text-[#171613]">
                      {item.tenantName}
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#C65D3A]">
                      {item.roomNumber}
                    </td>
                    <td className="p-4 text-[#716C63] font-mono">
                      {item.tenantPhone}
                    </td>
                    <td className="p-4 font-mono">
                      ₹{Number(item.monthlyRent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono text-[#B6473F] font-semibold">
                      {item.penalty > 0 ? `+₹${item.penalty}` : '₹0'}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#171613]">
                      ₹{Number(item.totalDue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono text-[#657A52]">
                      ₹{Number(item.amountPaid || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#B6473F]">
                      ₹{Number(item.balance || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-[#716C63]">
                      {item.dueDate}
                      {item.daysOverdue > 0 && (
                        <span className="block text-[10px] font-bold text-[#B6473F]">
                          ({item.daysOverdue} days late)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onRecordPaymentForRent(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C65D3A] hover:bg-[#B04F2E] text-white font-semibold text-xs rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Record Payment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payment Transactions Stream */}
      <div className="bg-white rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)] overflow-hidden">
        <div className="p-6 border-b border-[#E6E0D6] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#171613] font-['Outfit']">
              Recent Transactions & Receipts
            </h3>
            <p className="text-xs text-[#716C63]">Latest rent collections recorded in the database</p>
          </div>
          <button
            onClick={() => onNavigateToTab('payments')}
            className="text-xs font-semibold text-[#C65D3A] hover:text-[#B04F2E] flex items-center gap-1 transition-colors"
          >
            View all transactions <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#716C63] font-bold uppercase text-[11px] border-b border-[#E6E0D6]">
              <tr>
                <th className="p-4">Txn ID</th>
                <th className="p-4">Tenant</th>
                <th className="p-4">Room</th>
                <th className="p-4">Month</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Reference</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6]">
              {(!dashboardData.recentPayments || dashboardData.recentPayments.length === 0) ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-[#9E998F]">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                dashboardData.recentPayments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-4 font-mono font-semibold text-[#716C63]">
                      #{payment.paymentId}
                    </td>
                    <td className="p-4 font-bold text-[#171613]">
                      {payment.tenantName}
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#C65D3A]">
                      {payment.roomNumber}
                    </td>
                    <td className="p-4 font-semibold text-[#716C63]">
                      {payment.billingMonth}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#657A52]">
                      ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#ECE8E1] text-[#24231F]">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-[#716C63]">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#9E998F]">
                      {payment.transactionReference}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onViewReceipt(payment.paymentId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#171613] bg-[#FAF7F2] hover:bg-[#ECE6DC] border border-[#CEC6B8] rounded-lg transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#C65D3A]" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
