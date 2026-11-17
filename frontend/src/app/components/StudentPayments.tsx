import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Printer
} from 'lucide-react';
import { api } from '../../api';
import { PaymentSandboxModal } from './PaymentSandboxModal';

interface StudentPaymentsProps {
  user: any;
}

export function StudentPayments({ user }: StudentPaymentsProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    transactionId: string;
    amount: number;
  }>({
    isOpen: false,
    transactionId: '',
    amount: 0,
  });
  const [initiatingId, setInitiatingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const token = localStorage.getItem('hall_management_user')
    ? JSON.parse(localStorage.getItem('hall_management_user')!).token
    : '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invData, payData] = await Promise.all([
        api.get('/payments/invoices', token),
        api.get('/payments/history', token),
      ]);
      setInvoices(Array.isArray(invData) ? invData : []);
      setPayments(Array.isArray(payData) ? payData : []);
    } catch (err) {
      console.error('Failed to load payment records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayNow = async (invoice: any) => {
    try {
      setInitiatingId(invoice._id);
      const res = await api.post(`/payments/initiate/${invoice._id}`, {}, token);
      if (res.success) {
        if (res.isMock || res.gatewayUrl.includes('#payment-sandbox')) {
          setActiveModal({
            isOpen: true,
            transactionId: res.transactionId,
            amount: invoice.amount,
          });
        } else {
          // Redirect to external live/sandbox SSLCommerz gateway URL
          window.location.href = res.gatewayUrl;
        }
      }
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setInitiatingId(null);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Student Accounts & Treasury</span>
          <h2 className="text-2xl font-bold text-[#16324F] mt-1">Hall Fee Invoices & Payment Portal</h2>
          <p className="text-xs text-slate-500">
            Official fees payable to Pabna University of Science and Technology through SSLCommerz Sandbox Gateway.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Outstanding Invoices Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <CreditCard className="size-5 text-[#087E8B]" />
            <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
              Outstanding Invoices & Fees Due
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {invoices.filter((i) => i.status === 'unpaid').length} unpaid invoice(s)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading ledger records...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active invoices found for your student profile.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Fee Category</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-[#16324F]">
                      {inv.title}
                      {inv.description && <p className="text-[11px] text-slate-500 font-normal">{inv.description}</p>}
                    </td>
                    <td className="py-3.5 px-4 capitalize">{inv.category.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳ {inv.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.status === 'unpaid' ? (
                        <button
                          onClick={() => handlePayNow(inv)}
                          disabled={initiatingId === inv._id}
                          className="px-3.5 py-1.5 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {initiatingId === inv._id ? (
                            <RefreshCw className="size-3 animate-spin" />
                          ) : (
                            <CreditCard className="size-3" />
                          )}
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-3 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="size-3 text-[#087E8B]" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verified Payment Receipts History */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-[#16803C]" />
            <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
              Authoritative Payment History & Receipts
            </h3>
          </div>
          <span className="text-xs text-slate-500">{payments.length} transaction(s) recorded</span>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No completed payment transactions on file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Gateway / Card</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{p.transactionId}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {p.cardType || p.gateway || 'SSLCommerz Gateway'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳ {p.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          p.status === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'success' && (
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100 font-medium text-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="size-3 text-[#087E8B]" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SSLCommerz Sandbox Test Modal */}
      <PaymentSandboxModal
        isOpen={activeModal.isOpen}
        transactionId={activeModal.transactionId}
        amount={activeModal.amount}
        onClose={() => setActiveModal({ isOpen: false, transactionId: '', amount: 0 })}
        onSuccess={(payment) => {
          fetchData();
          setSelectedReceipt(payment);
        }}
      />

      {/* Institutional Printable Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Printable Receipt Area */}
            <div id="printable-receipt" className="space-y-6">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-[#16324F] leading-tight">
                    Pabna University of Science and Technology
                  </h3>
                  <p className="text-xs font-semibold text-[#087E8B]">Shadhinota Hall Official Money Receipt</p>
                  <p className="text-[11px] text-slate-400">Rajapur, Pabna-6600, Bangladesh</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-green-100 text-green-800 border border-green-200 text-xs font-bold uppercase tracking-wider">
                    PAID / VERIFIED
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <p className="text-slate-500 font-medium">Student Name:</p>
                  <p className="font-bold text-slate-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Student ID:</p>
                  <p className="font-bold text-slate-900 font-mono">{user.studentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Department:</p>
                  <p className="font-bold text-slate-900">{user.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Allocated Room / Seat:</p>
                  <p className="font-bold text-slate-900">{user.roomNumber || 'Room Assigned'} ({user.seatNumber || 'Standard Seat'})</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Transaction ID:</p>
                  <p className="font-bold text-slate-900 font-mono">{selectedReceipt.transactionId || selectedReceipt.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Payment Gateway:</p>
                  <p className="font-bold text-slate-900">{selectedReceipt.cardType || 'SSLCommerz Sandbox'}</p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {selectedReceipt.title || 'Hall Admission & Seat Allocation Fee'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        ৳ {selectedReceipt.amount?.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-2.5 px-4">Total Amount Verified & Received</td>
                      <td className="py-2.5 px-4 text-right font-mono text-sm text-[#16803C]">
                        ৳ {selectedReceipt.amount?.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-[11px] text-slate-400">
                <p>System Generated Digital Receipt • No physical signature required.</p>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-36 mb-1"></div>
                  <p className="text-slate-600 font-medium">Provost Office / Accounts</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 text-xs font-semibold bg-[#16324F] hover:bg-[#10263D] text-white rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="size-3.5" />
                <span>Print / Save PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
