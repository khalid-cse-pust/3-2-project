import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../../api';

interface PaymentSandboxModalProps {
  transactionId: string;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: any) => void;
}

export function PaymentSandboxModal({
  transactionId,
  amount,
  isOpen,
  onClose,
  onSuccess,
}: PaymentSandboxModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('hall_management_user')
        ? JSON.parse(localStorage.getItem('hall_management_user')!).token
        : '';

      const res = await api.post(
        '/payments/sandbox-simulate',
        {
          transactionId,
          cardType: `SSLCommerz Sandbox (${selectedMethod.toUpperCase()})`,
        },
        token
      );

      if (res.success) {
        onSuccess(res.payment);
        onClose();
      } else {
        setError(res.message || 'Payment simulation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Institutional SSLCommerz Sandbox Header */}
        <div className="bg-[#16324F] p-5 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#087E8B] flex items-center justify-center text-white">
              <CreditCard className="size-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">SSLCommerz Hosted Sandbox</h3>
              <p className="text-[11px] text-teal-200">Shadhinota Hall Official Fee Gateway</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900 uppercase tracking-wider">
            TEST MODE
          </span>
        </div>

        {/* Amount & Transaction Details */}
        <div className="p-6 space-y-4">
          <div className="bg-[#F5F7FA] p-4 rounded-lg border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Payable Amount</p>
              <p className="text-2xl font-bold text-[#16324F]">৳ {amount?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Transaction ID</p>
              <p className="text-xs font-mono font-semibold text-slate-700">{transactionId}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Sandbox Payment Instrument
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('bkash')}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedMethod === 'bkash'
                    ? 'border-[#087E8B] bg-teal-50 text-[#087E8B] font-bold shadow-sm ring-1 ring-[#087E8B]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">bKash</div>
                <div className="text-[10px] text-slate-400">Mobile Wallet</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('nagad')}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedMethod === 'nagad'
                    ? 'border-[#087E8B] bg-teal-50 text-[#087E8B] font-bold shadow-sm ring-1 ring-[#087E8B]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Nagad</div>
                <div className="text-[10px] text-slate-400">Digital Post</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'border-[#087E8B] bg-teal-50 text-[#087E8B] font-bold shadow-sm ring-1 ring-[#087E8B]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Debit Card</div>
                <div className="text-[10px] text-slate-400">VISA / Q-Cash</div>
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This triggers authoritative server-side SSLCommerz sandbox verification. In sandbox mode, no actual funds are deducted.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <XCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel Transaction
          </button>
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={loading}
            className="px-5 py-2.5 rounded-md text-xs font-semibold bg-[#16803C] hover:bg-[#136d33] text-white shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Verifying Gateway...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Confirm & Pay ৳{amount?.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
