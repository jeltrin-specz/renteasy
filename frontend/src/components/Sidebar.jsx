import React from 'react';
import {
  LayoutDashboard,
  Users,
  DoorClosed,
  CalendarDays,
  CreditCard,
  AlertOctagon,
  BarChart3,
  Settings,
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats = {} }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenants', icon: Users, badge: stats.activeTenants },
    { id: 'rooms', label: 'Rooms & Occupancy', icon: DoorClosed, badge: `${stats.occupiedRooms || 0}/${stats.totalRooms || 0}` },
    { id: 'rent', label: 'Monthly Rent', icon: CalendarDays },
    { id: 'payments', label: 'Payment Center', icon: CreditCard },
    { id: 'overdue', label: 'Overdue Dues', icon: AlertOctagon, badge: stats.overdueTenantsCount, badgeColor: 'bg-[#B6473F]' },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#171613] text-[#FAF7F2] min-h-screen flex flex-col justify-between border-r border-[#2A2824] select-none shrink-0 z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2A2824]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C65D3A] to-[#A04524] text-white flex items-center justify-center font-black text-lg font-['Outfit'] shadow-md shadow-[#C65D3A]/20">
              RE
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white font-['Outfit'] flex items-center gap-1.5">
                RENT-EASY
              </h1>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#9E998F]">
                PG & Hostel Manager
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#A8A298] mt-3 italic leading-tight">
            "Your PG. Your Rooms. Your Rent. One Clear Dashboard."
          </p>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#767168] mb-2">
            Operations
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#C65D3A] text-white font-semibold shadow-sm shadow-[#C65D3A]/30'
                    : 'text-[#CEC6B8] hover:bg-[#24221E] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#A8A298]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor
                        ? `${item.badgeColor} text-white`
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#2E2B26] text-[#CEC6B8]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Host Status */}
      <div className="p-4 m-3 rounded-xl bg-[#22201C] border border-[#2E2B26]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#657A52] animate-pulse"></div>
          <span className="text-xs font-semibold text-[#E6E0D6]">MySQL 8 & Spring API</span>
        </div>
        <p className="text-[11px] text-[#8C867B] mt-1">Backend Server: Connected</p>
        <div className="mt-2 pt-2 border-t border-[#2E2B26] flex items-center justify-between text-[11px] text-[#A8A298]">
          <span>Occupancy Rate</span>
          <span className="font-bold text-[#D39A45]">{stats.occupancyRate || 0}%</span>
        </div>
      </div>
    </aside>
  );
}
