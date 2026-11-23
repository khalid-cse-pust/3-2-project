import { useState, useEffect } from 'react';
import { User, Application, Problem } from '../App';
import { 
  LogOut, 
  FileText, 
  AlertCircle, 
  Plus, 
  Home, 
  UserCircle, 
  CreditCard, 
  Bell, 
  Download, 
  Clock, 
  Building2,
  Printer
} from 'lucide-react';
import { ApplicationForm } from './ApplicationForm';
import { ProblemForm } from './ProblemForm';
import { StudentAccount } from './StudentAccount';
import { StudentPayments } from './StudentPayments';
import { api } from '../../api';

interface StudentDashboardProps {
  user: User;
  applications: Application[];
  problems: Problem[];
  onLogout: () => void;
  onApplicationSubmit: (application: Omit<Application, 'id' | 'createdAt' | 'status'>) => void;
  onProblemSubmit: (problem: Omit<Problem, 'id' | 'createdAt' | 'status'>) => void;
}

type ActiveView = 'overview' | 'apply' | 'applications' | 'payments' | 'submit-problem' | 'problems' | 'notices' | 'account';

export function StudentDashboard({
  user,
  applications,
  problems,
  onLogout,
  onApplicationSubmit,
  onProblemSubmit,
}: StudentDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState<boolean>(true);
  const [showAllocationLetter, setShowAllocationLetter] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await api.get('/notices');
        setNotices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load notices:', err);
      } finally {
        setLoadingNotices(false);
      }
    };
    fetchNotices();
  }, []);

  const handleApplicationSubmit = (data: Omit<Application, 'id' | 'createdAt' | 'status'>) => {
    onApplicationSubmit(data);
    setActiveView('applications');
  };

  const handleProblemSubmit = (data: Omit<Problem, 'id' | 'createdAt' | 'status'>) => {
    onProblemSubmit(data);
    setActiveView('problems');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'resolved':
      case 'allocated':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
      case 'closed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'in-progress':
      case 'assigned':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const allocatedApp = applications.find((a) => a.status === 'allocated');
  const hasSeatAllocation = user.isResidential || !!allocatedApp;
  const displayRoom = user.roomNumber || allocatedApp?.assignedRoom || 'Assigned';
  const displaySeat = user.seatNumber || (allocatedApp as any)?.assignedSeat || 'Standard Bed';

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      {/* Sidebar */}
      <aside className="w-56 bg-[#16324F] text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#087E8B] flex items-center justify-center text-amber-300">
              <Building2 className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Shadhinota Hall</h2>
              <p className="text-[10px] text-slate-300">Student Portal</p>
            </div>
          </div>

          {/* User Status */}
          <div className="px-4 py-3 bg-[#0F2236] border-b border-slate-700/40 text-xs">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">ID: {user.studentId || 'Pending'}</p>
            <p className="text-[10px] text-teal-300 mt-0.5">
              {user.isResidential ? `Room ${user.roomNumber || 'Assigned'}` : 'Non-Residential'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="p-2 space-y-0.5 text-xs">
            <button
              onClick={() => setActiveView('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'overview'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home className="size-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('apply')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'apply'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Plus className="size-4" />
              <span>Apply for Seat</span>
            </button>

            <button
              onClick={() => setActiveView('applications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'applications'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="size-4" />
              <span>Applications ({applications.length})</span>
            </button>

            <button
              onClick={() => setActiveView('payments')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'payments'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <CreditCard className="size-4" />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setActiveView('submit-problem')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'submit-problem'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <AlertCircle className="size-4" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => setActiveView('problems')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'problems'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Clock className="size-4" />
              <span>My Complaints ({problems.length})</span>
            </button>

            <button
              onClick={() => setActiveView('notices')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'notices'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Bell className="size-4" />
              <span>Notices ({notices.length})</span>
            </button>

            <button
              onClick={() => setActiveView('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'account'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <UserCircle className="size-4" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        <div className="p-3 border-t border-slate-700/60">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto">
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Dashboard</h2>
                <p className="text-xs text-slate-500">{user.name} • {user.department || 'CSE'} (ID: {user.studentId || 'Pending'})</p>
              </div>

              {hasSeatAllocation && (
                <button
                  onClick={() => setShowAllocationLetter(true)}
                  className="px-3 py-1.5 rounded bg-[#16324F] hover:bg-[#0F2236] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-3.5 text-amber-300" />
                  <span>Allocation Letter</span>
                </button>
              )}
            </div>

            {/* Compact Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Seat Status</span>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {hasSeatAllocation ? `Room ${displayRoom}` : 'Non-Residential'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {hasSeatAllocation ? `Seat: ${displaySeat}` : 'No active allocation'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Seat Applications</span>
                <p className="text-xl font-bold text-[#087E8B] mt-1 font-mono">
                  {applications.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                  Status: {applications[0]?.status || 'None'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Complaints</span>
                <p className="text-xl font-bold text-slate-900 mt-1 font-mono">
                  {problems.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Active: {problems.filter(p => p.status !== 'resolved').length}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Hall Fee Invoices</h4>
                  <p className="text-slate-500">View dues and pay online via bKash / SSLCommerz.</p>
                </div>
                <button
                  onClick={() => setActiveView('payments')}
                  className="px-3 py-1.5 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-medium cursor-pointer"
                >
                  Pay Now
                </button>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Maintenance Request</h4>
                  <p className="text-slate-500">Report broken fan, light, plumbing, or Wi-Fi.</p>
                </div>
                <button
                  onClick={() => setActiveView('submit-problem')}
                  className="px-3 py-1.5 bg-[#16324F] hover:bg-[#0F2236] text-white rounded font-medium cursor-pointer"
                >
                  Report
                </button>
              </div>
            </div>

            {/* Recent Notices */}
            <div className="bg-white rounded-md border border-slate-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Notices</h4>
                <button
                  onClick={() => setActiveView('notices')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline cursor-pointer"
                >
                  All Notices &rarr;
                </button>
              </div>

              {loadingNotices ? (
                <p className="text-xs text-slate-500 py-2">Loading...</p>
              ) : notices.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No circulars posted.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notices.slice(0, 3).map((n) => (
                    <div key={n._id} className="py-2.5 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#087E8B] uppercase">{n.category.replace('_', ' ')}</span>
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-600 line-clamp-1">{n.content}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'apply' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Apply for Seat</h3>
            <ApplicationForm user={user} onSubmit={handleApplicationSubmit} />
          </div>
        )}

        {activeView === 'applications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Seat Applications</h3>
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No applications submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Student ID</th>
                        <th className="py-2.5 px-4">Program</th>
                        <th className="py-2.5 px-4">Room / Bed</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                        <th className="py-2.5 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {applications.map((app) => (
                        <tr key={app.id || app._id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-4 font-mono">{app.studentId}</td>
                          <td className="py-2.5 px-4">{app.program}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {app.assignedRoom ? `${app.assignedRoom} (${app.assignedSeat || 'Standard'})` : '-'}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{app.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'payments' && (
          <StudentPayments user={user} />
        )}

        {activeView === 'submit-problem' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Report Issue</h3>
            <ProblemForm user={user} onSubmit={handleProblemSubmit} />
          </div>
        )}

        {activeView === 'problems' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">My Complaints</h3>
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
              {problems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No issues reported.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Room</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                        <th className="py-2.5 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {problems.map((p) => (
                        <tr key={p.id || p._id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{p.category}</td>
                          <td className="py-2.5 px-4">{p.roomNumber}</td>
                          <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">{p.description}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{p.staffRemarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'notices' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Hall Notices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map((n) => (
                <div key={n._id} className="bg-white p-4 rounded-md border border-slate-200">
                  <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 capitalize">{n.category.replace('_', ' ')}</span>
                    <span>{new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{n.title}</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'account' && (
          <StudentAccount user={user} onNavigateToPayments={() => setActiveView('payments')} />
        )}

        {/* Allocation Order Modal */}
        {showAllocationLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-md border border-slate-300 max-w-xl w-full p-6 text-xs text-slate-800">
              <div className="text-center border-b pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 uppercase">Pabna University of Science and Technology</h3>
                <p className="font-semibold text-[#087E8B]">Shadhinota Hall • Seat Allocation Order</p>
              </div>

              <div className="space-y-3 mb-6">
                <p>This certifies that <strong>{user.name}</strong> (ID: {user.studentId}, Department of {user.department || 'CSE'}) is officially allocated:</p>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Room:</span>
                    <p className="font-bold text-slate-900">{displayRoom}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Bed:</span>
                    <p className="font-bold text-slate-900">{displaySeat}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setShowAllocationLetter(false)}
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
      </main>
    </div>
  );
}
