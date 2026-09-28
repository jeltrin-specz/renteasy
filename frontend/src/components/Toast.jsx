import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'info', message } = toast;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#171613] text-[#FAF7F2] border-[#4F623F]',
          icon: <CheckCircle2 className="w-5 h-5 text-[#88A66F] shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-[#2A1816] text-[#FDF0EF] border-[#B6473F]',
          icon: <AlertCircle className="w-5 h-5 text-[#E06A62] shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-[#2A2315] text-[#FBF4E8] border-[#D39A45]',
          icon: <AlertTriangle className="w-5 h-5 text-[#E5B267] shrink-0" />,
        };
      default:
        return {
          bg: 'bg-[#171613] text-[#FAF7F2] border-[#CEC6B8]',
          icon: <Info className="w-5 h-5 text-[#C65D3A] shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in shadow-2xl">
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} shadow-lg backdrop-blur-md`}>
        {style.icon}
        <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-[#CEC6B8] hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
