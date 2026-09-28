import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-0.5 text-xs font-semibold' 
    : 'px-3 py-1 text-sm font-semibold';

  switch (normalized) {
    case 'PAID':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#EFF4EB] text-[#4F623F] border border-[#D5E2CD] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#657A52]"></span>
          PAID
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FBF4E8] text-[#9E6D24] border border-[#F2DEBA] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D39A45]"></span>
          PENDING
        </span>
      );
    case 'PARTIALLY_PAID':
    case 'PARTIAL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FAF0E6] text-[#A25725] border border-[#F2D7C2] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C65D3A]"></span>
          PARTIALLY PAID
        </span>
      );
    case 'OVERDUE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EF] text-[#A6352D] border border-[#F9CBC8] ${sizeClasses} animate-pulse`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6473F]"></span>
          OVERDUE
        </span>
      );
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#EFF4EB] text-[#4F623F] border border-[#D5E2CD] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#657A52]"></span>
          ACTIVE
        </span>
      );
    case 'VACATED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#ECE8E1] text-[#6E6960] border border-[#DDD6CB] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9E998F]"></span>
          VACATED
        </span>
      );
    case 'OCCUPIED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FDF1ED] text-[#A04524] border border-[#F9D4C7] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C65D3A]"></span>
          OCCUPIED
        </span>
      );
    case 'VACANT':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#EFF4EB] text-[#4F623F] border border-[#D5E2CD] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#657A52]"></span>
          VACANT
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-[#EAE5DC] text-[#4F4A42] ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
