import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  DoorClosed,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  LogOut,
  ChevronRight,
  X,
  Clock,
  Shield,
  FileText,
  AlertTriangle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function TenantsPage({
  tenants = [],
  vacantRooms = [],
  allRooms = [],
  selectedTenantId,
  onSelectTenant,
  onCloseTenantDrawer,
  onOpenRegisterModal,
  onVacateTenant,
  onRecordPaymentForTenant,
  onViewReceipt,
  isLoading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, VACATED
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter and sort tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesSearch = !searchQuery || 
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        (t.roomNumber && t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tenants, searchQuery, statusFilter, sortField, sortDirection]);

  // Find currently selected tenant for detailed drawer
  const activeTenantDetail = useMemo(() => {
    if (!selectedTenantId) return null;
    return tenants.find(t => t.tenantId === selectedTenantId);
  }, [selectedTenantId, tenants]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171613] font-['Outfit'] tracking-tight">
            Tenant Directory & Profiles
          </h2>
          <p className="text-xs text-[#716C63] mt-1 font-medium">
            Manage active occupant leases, assigned rooms, identity verification, and monthly payment records.
          </p>
        </div>
        <button
          onClick={onOpenRegisterModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C65D3A] hover:bg-[#B04F2E] text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Register New Tenant
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.03)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9E998F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F1EA] text-xs text-[#24231F] rounded-xl border border-transparent focus:border-[#C65D3A] focus:outline-none focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F1EA] rounded-xl border border-[#E6E0D6] self-stretch md:self-auto justify-center">
          {[
            { id: 'ALL', label: `All (${tenants.length})` },
            { id: 'ACTIVE', label: `Active (${tenants.filter(t => t.status === 'ACTIVE').length})` },
            { id: 'VACATED', label: `Vacated (${tenants.filter(t => t.status === 'VACATED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#716C63] font-bold uppercase text-[11px] border-b border-[#E6E0D6]">
              <tr>
                <th className="p-4 cursor-pointer" onClick={() => { setSortField('fullName'); setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); }}>
                  Tenant Name
                </th>
                <th className="p-4">Assigned Room</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4">Move-In Date</th>
                <th className="p-4">Monthly Rent</th>
                <th className="p-4">Current Month</th>
                <th className="p-4">Outstanding Dues</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6]">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-[#9E998F]">
                    No tenants match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr
                    key={t.tenantId}
                    onClick={() => onSelectTenant(t.tenantId)}
                    className="hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#171613] text-sm">{t.fullName}</div>
                      <div className="text-[11px] text-[#9E998F] font-mono">{t.gender || 'Not specified'}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#C65D3A]">
                      {t.roomNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-[#24231F] font-semibold">{t.phone}</div>
                      {t.email && <div className="text-[11px] text-[#9E998F]">{t.email}</div>}
                    </td>
                    <td className="p-4 text-[#716C63]">
                      {t.moveInDate}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#171613]">
                      ₹{Number(t.monthlyRent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={t.currentMonthStatus || 'PENDING'} size="sm" />
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {t.totalOutstandingDues > 0 ? (
                        <span className="text-[#B6473F]">
                          ₹{Number(t.totalOutstandingDues).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[#657A52]">₹0.00</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {t.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => onRecordPaymentForTenant(t)}
                              title="Record Payment"
                              className="p-1.5 bg-[#FDF1ED] hover:bg-[#C65D3A] text-[#C65D3A] hover:text-white rounded-lg transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onVacateTenant(t)}
                              title="Vacate Tenant"
                              className="p-1.5 bg-[#FAF7F2] hover:bg-[#B6473F] text-[#716C63] hover:text-white rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onSelectTenant(t.tenantId)}
                          className="p-1.5 text-[#9E998F] hover:text-[#171613] rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile Slide-Over Drawer */}
      {activeTenantDetail && (
        <div className="fixed inset-0 z-40 flex justify-end bg-[#171613]/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-[#E6E0D6]">
            
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#171613] text-white flex items-center justify-center font-bold text-base font-['Outfit']">
                    {activeTenantDetail.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#171613] font-['Outfit']">
                      {activeTenantDetail.fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={activeTenantDetail.status} size="sm" />
                      <span className="text-xs text-[#9E998F]">• ID #{activeTenantDetail.tenantId}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onCloseTenantDrawer}
                  className="p-1.5 rounded-lg text-[#9E998F] hover:text-[#171613] hover:bg-[#F5F1EA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial Metrics Strip */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                  <p className="text-[10px] uppercase font-bold text-[#9E998F]">Total Paid Rent</p>
                  <p className="text-base font-bold text-[#657A52] font-mono mt-0.5">
                    ₹{Number(activeTenantDetail.totalAmountPaid || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                  <p className="text-[10px] uppercase font-bold text-[#9E998F]">Outstanding Dues</p>
                  <p className={`text-base font-bold font-mono mt-0.5 ${activeTenantDetail.totalOutstandingDues > 0 ? 'text-[#B6473F]' : 'text-[#657A52]'}`}>
                    ₹{Number(activeTenantDetail.totalOutstandingDues || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Personal & Room Details */}
              <div className="space-y-4 text-xs">
                
                {/* Room Info */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171613] mb-2 uppercase tracking-wider">
                    <DoorClosed className="w-4 h-4 text-[#C65D3A]" />
                    <span>Assigned Room Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[#57524A]">
                    <div>Room: <strong className="text-[#171613]">{activeTenantDetail.roomNumber}</strong></div>
                    <div>Floor: <strong className="text-[#171613]">{activeTenantDetail.floor ? `Floor ${activeTenantDetail.floor}` : 'N/A'}</strong></div>
                    <div>Room Type: <strong className="text-[#171613]">{activeTenantDetail.roomType || 'Standard'}</strong></div>
                    <div>Monthly Rent: <strong className="text-[#C65D3A]">₹{activeTenantDetail.monthlyRent}</strong></div>
                    <div>Move-In: <strong className="text-[#171613]">{activeTenantDetail.moveInDate}</strong></div>
                    {activeTenantDetail.moveOutDate && (
                      <div>Move-Out: <strong className="text-[#B6473F]">{activeTenantDetail.moveOutDate}</strong></div>
                    )}
                  </div>
                </div>

                {/* Contact & Identity Info */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171613] mb-1 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-[#657A52]" />
                    <span>Contact & Verification</span>
                  </div>
                  <div className="text-[#57524A] space-y-1">
                    <p><strong>Phone:</strong> {activeTenantDetail.phone}</p>
                    {activeTenantDetail.email && <p><strong>Email:</strong> {activeTenantDetail.email}</p>}
                    {activeTenantDetail.address && <p><strong>Address:</strong> {activeTenantDetail.address}</p>}
                    <p><strong>ID Proof:</strong> {activeTenantDetail.idProofType || 'Aadhaar'} — {activeTenantDetail.idProofNumber || 'Not recorded'}</p>
                  </div>
                </div>

                {/* Emergency Contact */}
                {activeTenantDetail.emergencyContactName && (
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#171613] mb-1 uppercase tracking-wider">
                      <Phone className="w-4 h-4 text-[#D39A45]" />
                      <span>Emergency Contact</span>
                    </div>
                    <div className="text-[#57524A]">
                      <p><strong>Name:</strong> {activeTenantDetail.emergencyContactName}</p>
                      <p><strong>Phone:</strong> {activeTenantDetail.emergencyContactPhone}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions for Active Tenant */}
            {activeTenantDetail.status === 'ACTIVE' && (
              <div className="pt-4 mt-6 border-t border-[#E6E0D6] flex items-center gap-3">
                <button
                  onClick={() => {
                    onCloseTenantDrawer();
                    onRecordPaymentForTenant(activeTenantDetail);
                  }}
                  className="flex-1 py-2.5 bg-[#C65D3A] hover:bg-[#B04F2E] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </button>
                <button
                  onClick={() => {
                    onCloseTenantDrawer();
                    onVacateTenant(activeTenantDetail);
                  }}
                  className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#FDF0EF] text-[#B6473F] border border-[#E6E0D6] hover:border-[#F9CBC8] font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Vacate Tenant
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
