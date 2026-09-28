import React from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ReceiptModal({ isOpen, receipt, onClose }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.paymentDate 
    ? new Date(receipt.paymentDate).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : new Date().toLocaleDateString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171613]/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-[#E6E0D6] my-8 relative">
        
        {/* Top Actions (hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E0D6] no-print">
          <span className="text-xs font-bold uppercase tracking-wider text-[#716C63]">
            Digital Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171613] bg-[#F5F1EA] hover:bg-[#ECE6DC] border border-[#CEC6B8] rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9E998F] hover:text-[#24231F] hover:bg-[#F5F1EA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="space-y-6 text-[#24231F]">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#171613] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C65D3A] text-white flex items-center justify-center font-bold text-sm font-['Outfit']">
                  RE
                </div>
                <h2 className="text-xl font-extrabold tracking-tight font-['Outfit'] text-[#171613]">
                  RENT-EASY
                </h2>
              </div>
              <p className="text-xs text-[#716C63] mt-1 font-medium">PG & Hostel Management System</p>
              <p className="text-[11px] text-[#9E998F]">Official Rent Payment Acknowledgement</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-[#FAF7F2] border border-[#CEC6B8] rounded text-[#171613]">
                {receipt.receiptNumber || 'REC-OFFICIAL'}
              </span>
              <p className="text-xs text-[#716C63] mt-1.5">Date: <span className="font-semibold text-[#24231F]">{formattedDate}</span></p>
            </div>
          </div>

          {/* Tenant & Room Info */}
          <div className="grid grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#E6E0D6]">
            <div>
              <p className="text-[11px] uppercase font-bold text-[#9E998F] tracking-wider">Tenant Details</p>
              <p className="text-sm font-bold text-[#171613] mt-1">{receipt.tenantName}</p>
              <p className="text-xs text-[#716C63]">{receipt.tenantPhone}</p>
              {receipt.tenantEmail && <p className="text-xs text-[#716C63]">{receipt.tenantEmail}</p>}
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-[#9E998F] tracking-wider">Room & Billing</p>
              <p className="text-sm font-bold text-[#171613] mt-1">Room {receipt.roomNumber} {receipt.floor ? `(Floor ${receipt.floor})` : ''}</p>
              <p className="text-xs text-[#716C63]">Billing Month: <span className="font-semibold text-[#C65D3A]">{receipt.billingMonth}</span></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-[#E6E0D6] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ECE6DC] text-[#24231F] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E0D6]">
                <tr>
                  <td className="p-3 font-medium text-[#24231F]">Base Monthly Room Rent ({receipt.billingMonth})</td>
                  <td className="p-3 text-right font-mono font-medium">₹{Number(receipt.baseRent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                {receipt.penaltyAmount > 0 && (
                  <tr className="bg-[#FDF0EF]/40">
                    <td className="p-3 font-medium text-[#B6473F]">Overdue Late Fee / Penalty</td>
                    <td className="p-3 text-right font-mono font-medium text-[#B6473F]">+ ₹{Number(receipt.penaltyAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
                <tr className="bg-[#FAF7F2] font-semibold text-[#171613]">
                  <td className="p-3">Total Monthly Obligation</td>
                  <td className="p-3 text-right font-mono">₹{Number(receipt.totalDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-[#EFF4EB]/60 font-bold text-[#4F623F]">
                  <td className="p-3 text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#657A52]" />
                    Amount Paid in this Transaction
                  </td>
                  <td className="p-3 text-right font-mono text-sm">₹{Number(receipt.paymentAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6E0D6]">
            <div>
              <span className="text-[#9E998F] block">Payment Method:</span>
              <span className="font-semibold text-[#171613]">{receipt.paymentMethod || 'UPI'}</span>
            </div>
            <div>
              <span className="text-[#9E998F] block">Transaction Reference:</span>
              <span className="font-mono text-[#171613] font-semibold">{receipt.transactionReference || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#9E998F] block">Remaining Dues for Month:</span>
              <span className={`font-mono font-bold ${receipt.remainingBalance > 0 ? 'text-[#B6473F]' : 'text-[#657A52]'}`}>
                ₹{Number(receipt.remainingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[#9E998F] block">Obligation Status:</span>
              <span className="mt-0.5 inline-block">
                <StatusBadge status={receipt.remainingBalance === 0 ? 'PAID' : (receipt.status || 'PARTIAL')} size="sm" />
              </span>
            </div>
          </div>

          {/* Notes & Seal */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E6E0D6] text-[11px] text-[#716C63]">
            <div className="flex items-center gap-1.5 text-[#657A52] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified System-Generated Receipt</span>
            </div>
            <div className="text-right italic">
              Thank you for your timely payment!
            </div>
          </div>

        </div>

        {/* Bottom Close Button (no-print) */}
        <div className="mt-6 pt-4 border-t border-[#E6E0D6] flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-[#171613] hover:bg-[#2A2824] text-white rounded-lg transition-all"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
