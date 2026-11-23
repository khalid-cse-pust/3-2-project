import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../api';

export function AdminPaymentManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'transactions'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    studentId: '',
    category: 'monthly_hall_fee',
    title: 'Monthly Hall Fee',
    amount: 850,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      await api.post('/payments/invoices', newInvoiceData, token);
      setShowAddInvoice(false);
      setNewInvoiceData({
        studentId: '',
        category: 'monthly_hall_fee',
        title: 'Monthly Hall Fee',
        amount: 850,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOutstanding = invoices
    .filter((i) => i.status === 'unpaid')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const filteredInvoices = invoices.filter(
    (i) =>
      i.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(
    (p) =>
      p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-xs text-slate-800 antialiased">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fee Ledger & Invoices</h2>
          <p className="text-slate-500">Manage hall fee dues, view payments, and issue invoices.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddInvoice(true)}
            className="px-3 py-1.5 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>New Invoice</span>
          </button>
          <button
            onClick={fetchData}
            className="px-2.5 py-1 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-3.5 rounded-md border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Collected</span>
          <p className="text-xl font-bold text-emerald-700 mt-1 font-mono">৳ {totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-md border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Dues</span>
          <p className="text-xl font-bold text-amber-700 mt-1 font-mono">৳ {totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3.5 rounded-md border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Invoices</span>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">{invoices.length}</p>
        </div>
      </div>

      {/* Filter and Tab switcher */}
      <div className="bg-white p-3 rounded-md border border-slate-200 flex justify-between items-center gap-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1 font-semibold rounded ${
              activeTab === 'invoices' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1 font-semibold rounded ${
              activeTab === 'transactions' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payments ({payments.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search student ID or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="p-6 text-center text-slate-500">Loading ledger...</p>
      ) : activeTab === 'invoices' ? (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Student ID</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{inv.studentName}</td>
                    <td className="py-2.5 px-4 font-mono">{inv.studentId}</td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono">৳ {inv.amount?.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-medium">{p.transactionId}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{p.studentName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{p.cardType || p.gateway || 'SSLCommerz'}</td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono">৳ {p.amount?.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-sm w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-3">Issue Invoice</h3>
            {actionError && <div className="p-2 mb-3 bg-rose-50 text-rose-700 rounded border border-rose-200">{actionError}</div>}
            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 220133"
                  value={newInvoiceData.studentId}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, studentId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newInvoiceData.title}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInvoiceData.amount}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.dueDate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddInvoice(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-semibold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
