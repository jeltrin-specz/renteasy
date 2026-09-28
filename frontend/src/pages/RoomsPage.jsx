import React, { useState, useMemo } from 'react';
import {
  DoorClosed,
  Plus,
  Filter,
  CheckCircle2,
  Users,
  Building,
  X,
  CreditCard,
  UserPlus,
  Sparkles,
  Info
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function RoomsPage({
  rooms = [],
  tenants = [],
  selectedRoomId,
  onSelectRoom,
  onCloseRoomDrawer,
  onOpenAddRoomModal,
  onOpenRegisterTenantForRoom,
  onRecordPaymentForTenant,
  isLoading
}) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [occupancyFilter, setOccupancyFilter] = useState('ALL');

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchesType = typeFilter === 'ALL' || r.roomType === typeFilter;
      const matchesOccupancy = occupancyFilter === 'ALL' || r.occupancyStatus === occupancyFilter;
      return matchesType && matchesOccupancy;
    });
  }, [rooms, typeFilter, occupancyFilter]);

  // Group rooms by Floor
  const roomsByFloor = useMemo(() => {
    const grouped = {};
    filteredRooms.forEach(r => {
      const floorKey = `Floor ${r.floor}`;
      if (!grouped[floorKey]) grouped[floorKey] = [];
      grouped[floorKey].push(r);
    });
    return grouped;
  }, [filteredRooms]);

  // Selected room details
  const activeRoomDetail = useMemo(() => {
    if (!selectedRoomId) return null;
    return rooms.find(r => r.roomId === selectedRoomId);
  }, [selectedRoomId, rooms]);

  // Find tenant assigned to selected room
  const assignedTenant = useMemo(() => {
    if (!activeRoomDetail || activeRoomDetail.occupancyStatus !== 'OCCUPIED') return null;
    return tenants.find(t => t.roomId === activeRoomDetail.roomId && t.status === 'ACTIVE');
  }, [activeRoomDetail, tenants]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171613] font-['Outfit'] tracking-tight">
            Rooms & Floor Layout Matrix
          </h2>
          <p className="text-xs text-[#716C63] mt-1 font-medium">
            Interactive room inventory and occupancy status. Click any room card for details.
          </p>
        </div>
        <button
          onClick={onOpenAddRoomModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171613] hover:bg-[#2A2824] text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Room
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.03)] flex flex-wrap items-center justify-between gap-4">
        
        {/* Occupancy Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F1EA] rounded-xl border border-[#E6E0D6]">
          {[
            { id: 'ALL', label: `All Rooms (${rooms.length})` },
            { id: 'VACANT', label: `Vacant (${rooms.filter(r => r.occupancyStatus === 'VACANT').length})` },
            { id: 'OCCUPIED', label: `Occupied (${rooms.filter(r => r.occupancyStatus === 'OCCUPIED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOccupancyFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                occupancyFilter === tab.id
                  ? 'bg-white text-[#171613] shadow-sm font-bold'
                  : 'text-[#716C63] hover:text-[#24231F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Room Type Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#716C63] font-medium">Room Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F1EA] text-[#24231F] font-semibold text-xs rounded-xl border border-[#E6E0D6] focus:border-[#C65D3A] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="TRIPLE">Triple</option>
            <option value="DORMITORY">Dormitory</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-[#C65D3A]">
            <span className="w-3 h-3 rounded bg-[#FDF1ED] border border-[#C65D3A]"></span> Occupied
          </span>
          <span className="flex items-center gap-1.5 text-[#657A52]">
            <span className="w-3 h-3 rounded bg-[#EFF4EB] border border-[#657A52]"></span> Vacant (Ready)
          </span>
        </div>

      </div>

      {/* Floor by Floor Layout Grid */}
      <div className="space-y-8">
        {Object.keys(roomsByFloor).length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E6E0D6] text-center text-[#9E998F]">
            <DoorClosed className="w-10 h-10 mx-auto mb-2 text-[#CEC6B8]" />
            No rooms match the selected filters.
          </div>
        ) : (
          Object.entries(roomsByFloor).map(([floorTitle, floorRooms]) => (
            <div key={floorTitle} className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#C65D3A]" />
                <h3 className="text-sm font-bold text-[#171613] uppercase tracking-wider font-['Outfit']">
                  {floorTitle} ({floorRooms.length} Rooms)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {floorRooms.map((room) => {
                  const isOccupied = room.occupancyStatus === 'OCCUPIED';
                  return (
                    <div
                      key={room.roomId}
                      onClick={() => onSelectRoom(room.roomId)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-md ${
                        isOccupied
                          ? 'bg-white border-[#F2D7C2] hover:border-[#C65D3A]'
                          : 'bg-white border-[#D5E2CD] hover:border-[#657A52]'
                      }`}
                    >
                      {/* Top status indicator line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 ${
                          isOccupied ? 'bg-[#C65D3A]' : 'bg-[#657A52]'
                        }`}
                      ></div>

                      <div className="flex items-start justify-between mt-1 mb-2">
                        <span className="text-base font-extrabold font-['Outfit'] text-[#171613]">
                          {room.roomNumber}
                        </span>
                        <StatusBadge status={room.occupancyStatus} size="sm" />
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-[#716C63] font-medium">{room.roomType}</p>
                        <p className="font-mono font-bold text-[#171613]">
                          ₹{Number(room.monthlyRent || 0).toLocaleString('en-IN')}<span className="text-[10px] text-[#9E998F] font-normal">/mo</span>
                        </p>
                        {isOccupied && room.currentTenantName && (
                          <p className="text-[11px] font-semibold text-[#C65D3A] truncate pt-1 border-t border-[#F0EBE3]">
                            {room.currentTenantName}
                          </p>
                        )}
                        {!isOccupied && (
                          <p className="text-[11px] font-semibold text-[#657A52] pt-1 border-t border-[#F0EBE3]">
                            Available to assign
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Room Detail Slide-Over Drawer */}
      {activeRoomDetail && (
        <div className="fixed inset-0 z-40 flex justify-end bg-[#171613]/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-[#E6E0D6]">
            
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D6]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-[#171613] font-['Outfit']">
                      Room {activeRoomDetail.roomNumber}
                    </h3>
                    <StatusBadge status={activeRoomDetail.occupancyStatus} size="sm" />
                  </div>
                  <p className="text-xs text-[#716C63] mt-0.5">Floor {activeRoomDetail.floor} • {activeRoomDetail.roomType}</p>
                </div>
                <button
                  onClick={onCloseRoomDrawer}
                  className="p-1.5 rounded-lg text-[#9E998F] hover:text-[#171613] hover:bg-[#F5F1EA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Room Specifications */}
              <div className="space-y-4 my-6 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                    <span className="text-[10px] uppercase font-bold text-[#9E998F] block">Monthly Rent</span>
                    <span className="text-base font-bold text-[#171613] font-mono mt-0.5 block">
                      ₹{Number(activeRoomDetail.monthlyRent || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                    <span className="text-[10px] uppercase font-bold text-[#9E998F] block">Bed Capacity</span>
                    <span className="text-base font-bold text-[#171613] font-mono mt-0.5 block">
                      {activeRoomDetail.capacity} Person(s)
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                {activeRoomDetail.amenities && (
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E0D6]">
                    <p className="text-[10px] uppercase font-bold text-[#9E998F] mb-1.5">Amenities Included</p>
                    <p className="text-[#57524A] leading-relaxed font-medium">
                      {activeRoomDetail.amenities}
                    </p>
                  </div>
                )}

                {/* Occupancy Info */}
                {activeRoomDetail.occupancyStatus === 'OCCUPIED' && (
                  <div className="p-4 rounded-xl bg-[#FDF1ED] border border-[#F9D4C7] space-y-2">
                    <p className="text-[10px] uppercase font-bold text-[#C65D3A] tracking-wider">
                      Current Occupant
                    </p>
                    {assignedTenant ? (
                      <div className="text-xs text-[#24231F] space-y-1">
                        <p className="font-bold text-sm text-[#171613]">{assignedTenant.fullName}</p>
                        <p className="text-[#716C63]">Phone: {assignedTenant.phone}</p>
                        <p className="text-[#716C63]">Move-In: {assignedTenant.moveInDate}</p>
                        <div className="pt-2 border-t border-[#F2D7C2] flex items-center justify-between font-bold">
                          <span>Outstanding Rent:</span>
                          <span className={assignedTenant.totalOutstandingDues > 0 ? 'text-[#B6473F]' : 'text-[#657A52]'}>
                            ₹{Number(assignedTenant.totalOutstandingDues || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#716C63]">Tenant: {activeRoomDetail.currentTenantName || 'Occupied'}</p>
                    )}
                  </div>
                )}

                {activeRoomDetail.occupancyStatus === 'VACANT' && (
                  <div className="p-4 rounded-xl bg-[#EFF4EB] border border-[#D5E2CD] text-xs text-[#4F623F]">
                    <p className="font-bold text-sm">Room is Ready for Check-in</p>
                    <p className="mt-1">No active tenant currently assigned. You can register a new tenant and allocate this room.</p>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E6E0D6]">
              {activeRoomDetail.occupancyStatus === 'VACANT' ? (
                <button
                  onClick={() => {
                    onCloseRoomDrawer();
                    onOpenRegisterTenantForRoom(activeRoomDetail.roomId);
                  }}
                  className="w-full py-2.5 bg-[#657A52] hover:bg-[#526442] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign Tenant to this Room
                </button>
              ) : (
                assignedTenant && (
                  <button
                    onClick={() => {
                      onCloseRoomDrawer();
                      onRecordPaymentForTenant(assignedTenant);
                    }}
                    className="w-full py-2.5 bg-[#C65D3A] hover:bg-[#B04F2E] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Record Rent Payment for Tenant
                  </button>
                )
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
