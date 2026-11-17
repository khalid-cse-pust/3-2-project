import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  DollarSign,
  TrendingUp,
  FileSpreadsheet
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
    title: 'Monthly Hall & Dining Dues',
    amount: 1200,
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
        title: 'Monthly Hall & Dining Dues',
        amount: 1200,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to issue invoice');
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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Financial Operations</span>
          <h2 className="text-2xl font-bold text-[#16324F] mt-1">Fee Invoices & Payment Ledger</h2>
          <p className="text-xs text-slate-500">
            Monitor verified student hall fee transactions, unpaid dues, and issue monthly invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddInvoice(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-[#087E8B] hover:bg-[#066570] text-white rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Verified Collections</span>
            <div className="p-2 rounded bg-green-50 text-[#16803C]">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#16324F] mt-2 font-mono">
            ৳ {totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Authorized through SSLCommerz Gateway</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Dues / Receivable</span>
            <div className="p-2 rounded bg-amber-50 text-amber-700">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#16324F] mt-2 font-mono">
            ৳ {totalOutstanding.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Pending student clearance</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoices Issued</span>
            <div className="p-2 rounded bg-teal-50 text-[#087E8B]">
              <CreditCard className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#16324F] mt-2 font-mono">
            {invoices.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Active ledger records</p>
        </div>
      </div>

      {/* Search and Tab Switcher */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-[#16324F] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-[#16324F] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Transactions ({payments.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student ID or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
          />
        </div>
      </div>

      {/* Tables */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading ledger data...</div>
      ) : activeTab === 'invoices' ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium text-[#16324F]">{inv.studentName}</td>
                    <td className="py-3 px-4 font-mono">{inv.studentId}</td>
                    <td className="py-3 px-4 capitalize">{inv.category.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳ {inv.amount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Gateway / Card</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{p.transactionId}</td>
                    <td className="py-3 px-4 font-medium text-[#16324F]">{p.studentName}</td>
                    <td className="py-3 px-4 font-mono">{p.studentId}</td>
                    <td className="py-3 px-4">{p.cardType || p.gateway || 'SSLCommerz'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳ {p.amount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#16324F] mb-4">Issue Fee Invoice</h3>
            {actionError && (
              <div className="mb-4 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-200">
                {actionError}
              </div>
            )}
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student University ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 220133"
                  value={newInvoiceData.studentId}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fee Category</label>
                <select
                  value={newInvoiceData.category}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                >
                  <option value="seat_allocation_fee">Seat Allocation Fee</option>
                  <option value="monthly_hall_fee">Monthly Hall Fee</option>
                  <option value="semester_hall_fee">Semester Hall Fee</option>
                  <option value="hall_admission_fee">Hall Admission Fee</option>
                  <option value="renewal_fee">Seat Renewal Fee</option>
                  <option value="fine_or_damage">Fine or Facility Repair Charge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Invoice Title / Description</label>
                <input
                  type="text"
                  required
                  value={newInvoiceData.title}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInvoiceData.amount}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.dueDate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddInvoice(false)}
                  className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Issuing...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
