import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
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
      console.error('Failed to load payments:', err);
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
          window.location.href = res.gatewayUrl;
        }
      }
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setInitiatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs text-slate-800 antialiased">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hall Payments</h2>
          <p className="text-xs text-slate-500">Invoices and payment records for Shadhinota Hall.</p>
        </div>
        <button
          onClick={fetchData}
          className="px-2.5 py-1 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Invoices */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">Payable Invoices</h3>
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No invoices due.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-medium">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{inv.title}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {new Date(inv.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ৳ {inv.amount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {inv.status === 'unpaid' ? (
                          <button
                            onClick={() => handlePayNow(inv)}
                            disabled={initiatingId === inv._id}
                            className="px-3 py-1 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer disabled:opacity-50"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedReceipt(inv)}
                            className="text-[#087E8B] hover:underline font-semibold cursor-pointer"
                          >
                            Receipt
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
      </div>

      {/* Payment History */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">Payment History</h3>
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No payment transactions recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Transaction ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-medium">{p.transactionId}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{p.cardType || 'SSLCommerz'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ৳ {p.amount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Sandbox Modal */}
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

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-lg w-full p-6 text-slate-800">
            <div className="text-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">Pabna University of Science and Technology</h3>
              <p className="font-semibold text-[#087E8B]">Shadhinota Hall • Official Fee Receipt</p>
            </div>

            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Student:</span>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">ID:</span>
                  <p className="font-semibold font-mono text-slate-900">{user.studentId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Transaction ID:</span>
                  <p className="font-semibold font-mono text-slate-900">{selectedReceipt.transactionId || selectedReceipt.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Amount Paid:</span>
                  <p className="font-bold text-emerald-700 font-mono">৳ {selectedReceipt.amount?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#16324F] hover:bg-[#0F2236] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
