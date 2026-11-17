import { useState, useEffect } from 'react';
import { User, CreditCard, MapPin, GraduationCap, Download, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../api';

interface StudentAccountProps {
  user: { 
    name: string; 
    email: string;
    studentId?: string;
    department?: string;
    roomNumber?: string;
    seatNumber?: string;
    phone?: string;
  };
  onNavigateToPayments?: () => void;
}

export function StudentAccount({ user, onNavigateToPayments }: StudentAccountProps) {
  const [latestPayment, setLatestPayment] = useState<any | null>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const token = localStorage.getItem('hall_management_user')
          ? JSON.parse(localStorage.getItem('hall_management_user')!).token
          : '';
        if (token) {
          const [inv, pay] = await Promise.all([
            api.get('/payments/invoices', token),
            api.get('/payments/history', token),
          ]);
          if (Array.isArray(inv)) {
            setUnpaidInvoices(inv.filter((i: any) => i.status === 'unpaid'));
          }
          if (Array.isArray(pay) && pay.length > 0) {
            setLatestPayment(pay[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load student ledger:', err);
      }
    };
    fetchFinances();
  }, []);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Student Profile Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-[#16324F] mb-6 flex items-center gap-2">
          <User className="size-5 text-[#087E8B]" />
          <span>Student Official Profile</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <p className="text-slate-500 mb-0.5">Full Name</p>
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
            </div>
            
            <div className="border-b border-slate-100 pb-3">
              <p className="text-slate-500 mb-0.5 flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-[#087E8B]" />
                Student University ID
              </p>
              <p className="text-sm font-bold font-mono text-slate-900">{user.studentId || 'Not assigned'}</p>
            </div>
            
            <div className="border-b border-slate-100 pb-3">
              <p className="text-slate-500 mb-0.5">Email Address</p>
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <p className="text-slate-500 mb-0.5">Department</p>
              <p className="text-sm font-bold text-slate-900">{user.department || 'Computer Science & Engineering'}</p>
            </div>
            
            <div className="border-b border-slate-100 pb-3">
              <p className="text-slate-500 mb-0.5 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#087E8B]" />
                Hall Room & Bed
              </p>
              <p className="text-sm font-bold text-[#16324F]">
                {user.roomNumber ? `Room ${user.roomNumber} (${user.seatNumber || 'Standard Seat'})` : 'Non-Residential / Pending'}
              </p>
            </div>

            <div className="border-b border-slate-100 pb-3">
              <p className="text-slate-500 mb-0.5">Contact Phone</p>
              <p className="text-sm font-medium text-slate-900">{user.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hall Fee Ledger Summary & SSLCommerz Sandbox Shortcut */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
            <CreditCard className="size-5 text-[#16803C]" />
            <span>Hall Fee Status & SSLCommerz Payments</span>
          </h2>
          {onNavigateToPayments && (
            <button
              onClick={onNavigateToPayments}
              className="px-3.5 py-1.5 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-semibold cursor-pointer"
            >
              Open Payment Portal &rarr;
            </button>
          )}
        </div>

        {unpaidInvoices.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-amber-900 text-sm">
                You have {unpaidInvoices.length} outstanding invoice(s) due!
              </p>
              <p className="text-amber-700 mt-0.5">
                Total payable dues: ৳ {unpaidInvoices.reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            {onNavigateToPayments && (
              <button
                onClick={onNavigateToPayments}
                className="px-4 py-2 bg-[#16803C] hover:bg-[#136d33] text-white rounded-md font-semibold cursor-pointer shadow-sm"
              >
                Pay With SSLCommerz Now
              </button>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3 mb-4">
            <CheckCircle2 className="size-5 text-[#16803C]" />
            <div>
              <p className="font-bold text-green-900">All Hall Dues Cleared</p>
              <p className="text-green-700">No pending unpaid invoices on your student ledger.</p>
            </div>
          </div>
        )}

        {latestPayment && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <p className="text-slate-500 font-medium mb-1">Most Recent Payment Transaction:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
              <div>
                <span className="text-slate-400">Transaction ID:</span>
                <p className="font-mono font-bold">{latestPayment.transactionId}</p>
              </div>
              <div>
                <span className="text-slate-400">Amount Paid:</span>
                <p className="font-mono font-bold text-[#16803C]">৳ {latestPayment.amount?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Gateway:</span>
                <p className="font-medium">{latestPayment.cardType || 'SSLCommerz Sandbox'}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="font-bold text-[#16803C] uppercase">{latestPayment.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
