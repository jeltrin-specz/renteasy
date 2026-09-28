import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  UserPlus,
  CreditCard,
  DoorOpen,
  X,
  AlertTriangle,
  CheckCircle2,
  Building,
  ArrowRight
} from 'lucide-react';
import { tenantsApi, roomsApi, rentPaymentsApi } from '../api';

export default function TopHeader({
  onOpenRegisterTenant,
  onOpenRecordPayment,
  onOpenAddRoom,
  onSelectTenant,
  onSelectRoom,
  notifications = [],
  onClearNotification
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Format current month string, e.g. "September 2026"
  const currentMonthDisplay = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Global search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.trim();
        const [tenants, rooms] = await Promise.all([
          tenantsApi.search(query).catch(() => []),
          roomsApi.getAll().catch(() => [])
        ]);

        const matchedRooms = rooms.filter(r => 
          r.roomNumber.toLowerCase().includes(query.toLowerCase()) ||
          (r.amenities && r.amenities.toLowerCase().includes(query.toLowerCase()))
        );

        setSearchResults({
          tenants: tenants.slice(0, 5),
          rooms: matchedRooms.slice(0, 4)
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search and notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E6E0D6] px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_4px_rgba(23,22,19,0.02)]">
      
      {/* Search Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#9E998F] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tenant name, phone, room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-[#F5F1EA] hover:bg-[#FAF7F2] focus:bg-white text-sm text-[#24231F] placeholder-[#9E998F] rounded-xl border border-transparent focus:border-[#C65D3A] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="absolute right-2.5 p-1 text-[#9E998F] hover:text-[#24231F]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Dropdown */}
        {searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-[#E6E0D6] p-3 max-h-96 overflow-y-auto z-50">
            {isSearching && (
              <p className="text-xs text-[#9E998F] p-2">Searching database...</p>
            )}

            {/* Tenants match */}
            {searchResults.tenants && searchResults.tenants.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E998F] px-2 mb-1.5">
                  Tenants
                </p>
                {searchResults.tenants.map(t => (
                  <button
                    key={t.tenantId}
                    onClick={() => {
                      onSelectTenant && onSelectTenant(t.tenantId);
                      setSearchResults(null);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#FAF7F2] flex items-center justify-between transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#24231F]">{t.fullName}</span>
                      <span className="text-[#716C63] ml-2 font-mono">({t.phone})</span>
                      <p className="text-[11px] text-[#9E998F]">
                        Room: <span className="text-[#C65D3A] font-semibold">{t.roomNumber}</span> • Rent: ₹{t.monthlyRent}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9E998F]" />
                  </button>
                ))}
              </div>
            )}

            {/* Rooms match */}
            {searchResults.rooms && searchResults.rooms.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E998F] px-2 mb-1.5">
                  Rooms
                </p>
                {searchResults.rooms.map(r => (
                  <button
                    key={r.roomId}
                    onClick={() => {
                      onSelectRoom && onSelectRoom(r.roomId);
                      setSearchResults(null);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#FAF7F2] flex items-center justify-between transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#24231F]">Room {r.roomNumber}</span>
                      <span className="text-[#716C63] ml-2">Floor {r.floor} • {r.roomType}</span>
                      <p className="text-[11px] text-[#9E998F]">
                        Status: <span className={r.occupancyStatus === 'OCCUPIED' ? 'text-[#C65D3A] font-semibold' : 'text-[#657A52] font-semibold'}>{r.occupancyStatus}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9E998F]" />
                  </button>
                ))}
              </div>
            )}

            {searchResults.tenants.length === 0 && searchResults.rooms.length === 0 && (
              <p className="text-xs text-[#716C63] p-3 text-center">No matching records found.</p>
            )}
          </div>
        )}
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        
        {/* Current Month Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-xs font-semibold text-[#57524A]">
          <Calendar className="w-3.5 h-3.5 text-[#C65D3A]" />
          <span>{currentMonthDisplay}</span>
        </div>

        {/* Quick Action: Register Tenant */}
        <button
          onClick={onOpenRegisterTenant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#171613] hover:bg-[#2A2824] text-white rounded-xl transition-all shadow-sm active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Register Tenant</span>
        </button>

        {/* Quick Action: Record Payment */}
        <button
          onClick={onOpenRecordPayment}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#C65D3A] hover:bg-[#B04F2E] text-white rounded-xl transition-all shadow-sm active:scale-95"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Record Payment</span>
        </button>

        {/* Notifications Drawer Toggle */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#716C63] hover:text-[#24231F] hover:bg-[#F5F1EA] relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C65D3A] ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#E6E0D6] p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#24231F]">
                  Notifications ({notifications.length})
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-[#9E998F] hover:text-[#24231F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-2 divide-y divide-[#F0EBE3] max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#9E998F] py-4 text-center">No new notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="py-2.5 flex items-start gap-2.5 text-xs">
                      {n.type === 'overdue' ? (
                        <AlertTriangle className="w-4 h-4 text-[#B6473F] shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#657A52] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-[#24231F] font-medium leading-snug">{n.message}</p>
                        <span className="text-[10px] text-[#9E998F]">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E6E0D6]">
          <div className="w-8 h-8 rounded-full bg-[#171613] text-white flex items-center justify-center text-xs font-bold font-['Outfit']">
            AD
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <span className="text-xs font-bold text-[#24231F] block">Hostel Admin</span>
            <span className="text-[10px] text-[#9E998F]">Super Administrator</span>
          </div>
        </div>

      </div>

    </header>
  );
}
