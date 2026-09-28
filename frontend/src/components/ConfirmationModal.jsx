import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  warningNote,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171613]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E6E0D6] transform transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
          <div className="flex items-center gap-2.5">
            {isDanger ? (
              <div className="p-2 rounded-lg bg-[#FDF0EF] text-[#B6473F]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : null}
            <h3 className="text-lg font-bold text-[#24231F] font-['Outfit']">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#9E998F] hover:text-[#24231F] hover:bg-[#F5F1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-sm text-[#57524A] leading-relaxed">
          {message}
          {warningNote && (
            <div className="mt-3 p-3 rounded-lg bg-[#FAF7F2] border border-[#E6E0D6] text-xs text-[#716C63]">
              <strong className="text-[#24231F]">Note: </strong> {warningNote}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EBE3]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#716C63] hover:text-[#24231F] bg-[#F5F1EA] hover:bg-[#ECE6DC] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all shadow-sm flex items-center gap-2 ${
              isDanger
                ? 'bg-[#B6473F] hover:bg-[#9E362F] active:scale-95'
                : 'bg-[#C65D3A] hover:bg-[#B04F2E] active:scale-95'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
