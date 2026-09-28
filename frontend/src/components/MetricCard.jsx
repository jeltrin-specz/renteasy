import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }) {
  const getBorderAndAccent = () => {
    switch (variant) {
      case 'terracotta':
        return 'border-l-4 border-l-[#C65D3A]';
      case 'amber':
        return 'border-l-4 border-l-[#D39A45]';
      case 'sage':
        return 'border-l-4 border-l-[#657A52]';
      case 'danger':
        return 'border-l-4 border-l-[#B6473F]';
      default:
        return 'border-l-4 border-l-[#171613]';
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'terracotta':
        return 'bg-[#FDF1ED] text-[#C65D3A]';
      case 'amber':
        return 'bg-[#FBF4E8] text-[#D39A45]';
      case 'sage':
        return 'bg-[#EFF4EB] text-[#657A52]';
      case 'danger':
        return 'bg-[#FDF0EF] text-[#B6473F]';
      default:
        return 'bg-[#ECE8E1] text-[#24231F]';
    }
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-[#E6E0D6] shadow-[0_2px_8px_rgba(23,22,19,0.04)] hover:shadow-[0_4px_16px_rgba(23,22,19,0.08)] transition-all ${getBorderAndAccent()}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#716C63] mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-['Outfit'] text-[#24231F] tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-[#9E998F] mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${getIconBg()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-[#F0EBE3] flex items-center gap-1.5 text-xs">
          <span className={trend.positive ? 'text-[#657A52] font-semibold' : 'text-[#B6473F] font-semibold'}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
          <span className="text-[#9E998F]">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
