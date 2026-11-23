import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  KeyRound,
  RotateCcw
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
  // Steps: 1 = Account Number, 2 = Verification Code (OTP), 3 = PIN, 4 = Processing animation, 5 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [accountNumber, setAccountNumber] = useState('01700000000');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [otp, setOtp] = useState('123456');
  const [pin, setPin] = useState('12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setLoading(false);
      setCountdown(30);
    }
  }, [isOpen, transactionId]);

  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleProceedStep1 = () => {
    if (!accountNumber || accountNumber.trim().length < 11) {
      setError('Please enter a valid 11-digit bKash account number');
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    setError('');
    setStep(2); // move to OTP step
  };

  const handleProceedStep2 = () => {
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError('');
    setStep(3); // move to PIN step
  };

  const handleFinalSubmit = async () => {
    if (!pin || pin.trim().length < 4) {
      setError('Please enter your 5-digit bKash PIN');
      return;
    }
    setError('');
    setLoading(true);
    setStep(4); // Processing animation

    try {
      const token = localStorage.getItem('hall_management_user')
        ? JSON.parse(localStorage.getItem('hall_management_user')!).token
        : '';

      // Realistic gateway processing delay (1.8s) for the authentic bKash animation
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const res = await api.post(
        '/payments/sandbox-simulate',
        {
          transactionId,
          paymentMethod: 'bKash',
          cardType: 'bKash Payment Gateway (Sandbox)',
          outcome: 'success',
        },
        token
      );

      if (res.success) {
        setStep(5);
        setTimeout(() => {
          onSuccess(res.payment);
          onClose();
        }, 1200);
      } else {
        setStep(3);
        setError(res.message || 'Payment simulation failed');
      }
    } catch (err: any) {
      setStep(3);
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[2px] p-4 transition-all">
      {/* Exact bKash Modal Container */}
      <div className="relative w-full max-w-[360px] sm:max-w-[380px] bg-[#e2136e] rounded-md shadow-2xl overflow-hidden border border-pink-400/40 animate-in fade-in zoom-in-95 duration-200">
        
        {/* bKash White Header with Bird Origami Logo */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-center border-b border-pink-100 shadow-sm">
          <div className="flex items-center gap-2">
            <svg
              className="w-9 h-9"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Official bKash Origami Bird Vector */}
              <polygon points="50,15 88,40 50,60" fill="#e2136e" />
              <polygon points="50,15 20,45 50,60" fill="#b80c54" />
              <polygon points="50,60 88,40 68,85" fill="#de1a6f" />
              <polygon points="20,45 35,80 50,60" fill="#c4105c" />
            </svg>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-[#b80c54]">bKash</span>
              <span className="text-sm font-normal text-slate-700 ml-1.5 font-sans">Payment</span>
            </div>
          </div>
        </div>

        {/* Pink Body Area */}
        <div className="p-6 text-white text-center font-sans">
          {/* Invoice Summary */}
          <div className="mb-5 space-y-1 text-xs text-pink-50">
            <p className="font-medium text-pink-100">Merchant : <span className="text-white font-bold">Shadhinota Hall PUST</span></p>
            <p className="font-mono text-[11px] text-pink-100">Invoice no : <span className="text-white font-semibold">{transactionId.slice(0, 16)}</span></p>
            <p className="font-bold text-sm text-white pt-1">
              Amount : <span className="font-mono font-extrabold text-amber-200 text-base">BDT {amount?.toLocaleString()}</span>
            </p>
          </div>

          {/* STEP 1: Account Number Input */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs font-medium text-pink-100">Your bKash account number</p>
              
              <div>
                <input
                  type="text"
                  maxLength={11}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g 01XXXXXXXXX"
                  className="w-full px-4 py-2.5 bg-white text-slate-900 rounded font-mono text-center text-sm font-semibold tracking-wider outline-none shadow-inner border border-white focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-pink-100">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded accent-white cursor-pointer size-3.5"
                />
                <label htmlFor="agreeTerms" className="cursor-pointer">
                  I agree to the <span className="underline font-semibold hover:text-white">terms and conditions</span>
                </label>
              </div>

              {error && (
                <div className="bg-white/95 text-red-700 text-[11px] font-semibold py-1.5 px-3 rounded shadow-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons: PROCEED & CLOSE */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProceedStep1}
                  className="w-full py-2 bg-[#b80c54] hover:bg-[#9c0745] active:scale-[0.98] text-white text-xs font-bold rounded shadow transition-all tracking-wider cursor-pointer border border-pink-400/30"
                >
                  PROCEED
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-[#b80c54] hover:bg-[#9c0745] active:scale-[0.98] text-white text-xs font-bold rounded shadow transition-all tracking-wider cursor-pointer border border-pink-400/30"
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Verification Code (OTP) */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <p className="text-xs font-medium text-pink-100">Enter verification code sent to</p>
                <p className="font-mono font-bold text-white text-xs">{accountNumber}</p>
              </div>
              
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g 123456"
                  className="w-full px-4 py-2.5 bg-white text-slate-900 rounded font-mono text-center text-sm font-semibold tracking-widest outline-none shadow-inner border border-white focus:ring-2 focus:ring-pink-300"
                />
                <p className="text-[10px] text-pink-200 mt-1.5">
                  Sandbox test code: <span className="font-mono font-bold text-white">123456</span>
                </p>
              </div>

              {error && (
                <div className="bg-white/95 text-red-700 text-[11px] font-semibold py-1.5 px-3 rounded shadow-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProceedStep2}
                  className="w-full py-2 bg-[#b80c54] hover:bg-[#9c0745] active:scale-[0.98] text-white text-xs font-bold rounded shadow transition-all tracking-wider cursor-pointer border border-pink-400/30"
                >
                  CONFIRM
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 bg-[#b80c54] hover:bg-[#9c0745] active:scale-[0.98] text-white text-xs font-bold rounded shadow transition-all tracking-wider cursor-pointer border border-pink-400/30"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter bKash PIN */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <p className="text-xs font-medium text-pink-100">Enter your 5-digit bKash PIN</p>
                <p className="text-[10px] text-pink-200">(Sandbox simulation - enter any 5-digit PIN)</p>
              </div>
              
              <div>
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••••"
                  className="w-full px-4 py-2.5 bg-white text-slate-900 rounded font-mono text-center text-lg font-bold tracking-widest outline-none shadow-inner border border-white focus:ring-2 focus:ring-pink-300"
                />
              </div>

              {error && (
                <div className="bg-white/95 text-red-700 text-[11px] font-semibold py-1.5 px-3 rounded shadow-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full py-2 bg-[#b80c54] hover:bg-[#9c0745] active:scale-[0.98] text-white text-xs font-bold rounded shadow transition-all tracking-wider cursor-pointer border border-pink-400/30"
                >
                  CONFIRM
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2 bg-[#b80c54] hover:bg-[#9c0745] active:scale-[0.98] text-white text-xs font-bold rounded shadow transition-all tracking-wider cursor-pointer border border-pink-400/30"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Processing Animation */}
          {step === 4 && (
            <div className="py-8 space-y-4 animate-in fade-in duration-200">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-pink-300/40 border-t-white animate-spin"></div>
                <svg
                  className="w-8 h-8 text-white animate-pulse"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <polygon points="50,15 88,40 50,60" />
                  <polygon points="50,15 20,45 50,60" />
                  <polygon points="50,60 88,40 68,85" />
                  <polygon points="20,45 35,80 50,60" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">Processing Payment...</p>
                <p className="text-xs text-pink-100 mt-1 font-mono">Contacting bKash Gateway API</p>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Success Animation */}
          {step === 5 && (
            <div className="py-6 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="mx-auto w-14 h-14 rounded-full bg-white text-[#e2136e] flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="size-9 text-[#e2136e]" />
              </div>
              <h4 className="text-base font-bold text-white">Payment Successful!</h4>
              <p className="text-xs text-pink-100">
                Amount <strong>BDT {amount?.toLocaleString()}</strong> received.
              </p>
            </div>
          )}

          {/* bKash Official Hotline Footer */}
          <div className="mt-6 pt-3 border-t border-pink-400/40 flex items-center justify-center gap-1.5 text-[11px] text-pink-100 font-medium">
            <Smartphone className="size-3.5 text-pink-200" />
            <span>16247</span>
          </div>
        </div>
      </div>
    </div>
  );
}
