import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  CreditCard,
  Search,
  Sparkles,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function RentPage({
  rentPayments = [],
  onRecordPaymentForRent,
  onGenerateCurrentMonthRent,
  isGenerating,
  isLoading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Extract unique billing months from records
  const availableMonths = useMemo(() => {
    const months = new Set(rentPayments.map(r => r.billingMonth));
    return Array.from(months).sort().reverse();
  }, [rentPayments]);

  // Filter rent payments
  const filteredRentPayments = useMemo(() => {
    return rentPayments.filter(r => {
      const matchesMonth = selectedMonth === 'ALL' || r.billingMonth === selectedMonth;
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesSearch = !searchQuery ||
        r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.tenantPhone && r.tenantPhone.includes(searchQuery));
      return matchesMonth && matchesStatus && matchesSearch;
    });
  }, [rentPayments, selectedMonth, statusFilter, searchQuery]);

  // Totals for the current filtered view
  const totals = useMemo(() => {
    let baseSum = 0;
    let penaltySum = 0;
    let totalDueSum = 0;
    let paidSum = 0;
    let balanceSum = 0;

    filteredRentPayments.forEach(r => {
      baseSum += r.baseRent || 0;
      penaltySum += r.penaltyAmount || 0;
      totalDueSum += r.totalDue || 0;
      paidSum += r.amountPaid || 0;
      balanceSum += r.balanceAmount || 0;
    });

    return { baseSum, penaltySum, totalDueSum, paidSum, balanceSum };
  }, [filteredRentPayments]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171613] font-['Outfit'] tracking-tight">
            Monthly Rent Obligations Ledger
          </h2>
          <p className="text-xs text-[#716C63] mt-1 font-medium">
            Systematic tracking of monthly rent dues, automated late fee penalties, balances, and payment statuses.
          </p>
        </div>
        <button
          onClick={onGenerateCurrentMonthRent}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171613] hover:bg-[#2A2824] text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <Sparkles className={`w-4 h-4 text-[#D39A45] ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Auto-Generate Current Month Obligations'}
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E6E0D6] shadow-[0_2px_6px_rgba(23,22,19,0.02)]">
          <p className="text-[10px] uppercase font-bold text-[#9E998F]">Total Obligations</p>
          <p className="text-lg font-bold font-mono text-[#171613] mt-0.5">
            ₹{totals.totalDueSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E6E0D6] shadow-[0_2px_6px_rgba(23,22,19,0.02)]">
          <p className="text-[10px] uppercase font-bold text-[#9E998F]">Total Collected</p>
          <p className="text-lg font-bold font-mono text-[#657A52] mt-0.5">
            ₹{totals.paidSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E6E0D6] shadow-[0_2px_6px_rgba(23,22,19,0.02)]">
          <p className="text-[10px] uppercase font-bold text-[#9E998F]">Total Outstanding Dues</p>
          <p className="text-lg font-bold font-mono text-[#B6473F] mt-0.5">
            ₹{totals.balanceSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E6E0D6] shadow-[0_2px_6px_rgba(23,22,19,0.02)]">
          <p className="text-[10px] uppercase font-bold text-[#9E998F]">Penalties Accrued</p>
          <p className="text-lg font-bold font-mono text-[#D39A45] mt-0.5">
            ₹{totals.penaltySum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.03)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#9E998F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tenant or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F1EA] text-xs text-[#24231F] rounded-xl border border-transparent focus:border-[#C65D3A] focus:outline-none focus:bg-white transition-all"
            />
          </div>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F1EA] text-[#24231F] font-semibold text-xs rounded-xl border border-[#E6E0D6] focus:border-[#C65D3A] focus:outline-none"
          >
            <option value="ALL">All Billing Months</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F1EA] rounded-xl border border-[#E6E0D6] self-stretch md:self-auto justify-center overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'PARTIALLY_PAID', label: 'Partial' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'PAID', label: 'Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-[#171613] shadow-sm font-bold'
                  : 'text-[#716C63] hover:text-[#24231F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Rent Obligations Table */}
      <div className="bg-white rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#716C63] font-bold uppercase text-[11px] border-b border-[#E6E0D6]">
              <tr>
                <th className="p-4">Obligation ID</th>
                <th className="p-4">Tenant Name</th>
                <th className="p-4">Room</th>
                <th className="p-4">Month</th>
                <th className="p-4">Base Rent</th>
                <th className="p-4">Late Penalty</th>
                <th className="p-4">Total Due</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6]">
              {filteredRentPayments.length === 0 ? (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-[#9E998F]">
                    No monthly rent obligations found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRentPayments.map((rp) => (
                  <tr key={rp.rentPaymentId} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#716C63]">
                      #{rp.rentPaymentId}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#171613]">{rp.tenantName}</div>
                      <div className="text-[11px] text-[#9E998F] font-mono">{rp.tenantPhone}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#C65D3A]">
                      {rp.roomNumber}
                    </td>
                    <td className="p-4 font-semibold text-[#171613]">
                      {rp.billingMonth}
                    </td>
                    <td className="p-4 font-mono">
                      ₹{Number(rp.baseRent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono text-[#B6473F] font-semibold">
                      {rp.penaltyAmount > 0 ? `+₹${rp.penaltyAmount}` : '₹0'}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#171613]">
                      ₹{Number(rp.totalDue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono text-[#657A52] font-semibold">
                      ₹{Number(rp.amountPaid || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {rp.balanceAmount > 0 ? (
                        <span className="text-[#B6473F]">
                          ₹{Number(rp.balanceAmount).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[#657A52]">₹0.00</span>
                      )}
                    </td>
                    <td className="p-4 text-[#716C63]">
                      {rp.dueDate}
                      {rp.daysOverdue > 0 && (
                        <span className="block text-[10px] font-bold text-[#B6473F]">
                          ({rp.daysOverdue}d late)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={rp.status} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      {rp.status !== 'PAID' && (
                        <button
                          onClick={() => onRecordPaymentForRent(rp)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C65D3A] hover:bg-[#B04F2E] text-white font-semibold text-xs rounded-lg transition-all shadow-sm active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay
                        </button>
                      )}
                      {rp.status === 'PAID' && (
                        <span className="text-xs text-[#657A52] font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
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
