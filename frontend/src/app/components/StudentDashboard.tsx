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
  Bed, 
  Download, 
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  Phone,
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress':
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] font-sans text-[#1F2937]">
      {/* Institutional Left Sidebar */}
      <aside className="w-64 bg-[#16324F] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#10263D]">
        <div>
          {/* Institution Header */}
          <div className="p-6 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#087E8B] flex items-center justify-center text-amber-300">
                <Building2 className="size-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Shadhinota Hall</h2>
                <p className="text-[11px] text-teal-200">PUST Student Portal</p>
              </div>
            </div>
          </div>

          {/* User Profile Mini Badge */}
          <div className="px-6 py-4 bg-[#10263D]/60 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-amber-300 border border-slate-600">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-300 font-mono">ID: {user.studentId || 'Pending'}</p>
                <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider ${
                  user.isResidential ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                }`}>
                  {user.isResidential ? `Room ${user.roomNumber || 'Assigned'}` : 'Non-Residential'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs">
            <button
              onClick={() => setActiveView('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'overview'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Home className="size-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveView('apply')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'apply'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Plus className="size-4" />
              <span>Apply for Seat</span>
            </button>

            <button
              onClick={() => setActiveView('applications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'applications'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <FileText className="size-4" />
              <span>Seat Applications ({applications.length})</span>
            </button>

            <button
              onClick={() => setActiveView('payments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'payments'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <CreditCard className="size-4" />
              <span>Fee Invoices & Payments</span>
            </button>

            <button
              onClick={() => setActiveView('submit-problem')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'submit-problem'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <AlertCircle className="size-4" />
              <span>Report Maintenance</span>
            </button>

            <button
              onClick={() => setActiveView('problems')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'problems'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Clock className="size-4" />
              <span>My Complaints ({problems.length})</span>
            </button>

            <button
              onClick={() => setActiveView('notices')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'notices'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Bell className="size-4" />
              <span>Hall Notices ({notices.length})</span>
            </button>

            <button
              onClick={() => setActiveView('account')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'account'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <UserCircle className="size-4" />
              <span>Student Profile</span>
            </button>
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-700/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto">
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="pb-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Academic Portal</span>
                <h2 className="text-2xl font-bold text-[#16324F] mt-1">Welcome, {user.name}</h2>
                <p className="text-xs text-slate-500">
                  Department of {user.department || 'Computer Science & Engineering'} • Student ID: {user.studentId || 'Pending'}
                </p>
              </div>

              {user.isResidential && (
                <button
                  onClick={() => setShowAllocationLetter(true)}
                  className="px-3.5 py-2 rounded-md bg-[#16324F] hover:bg-[#10263D] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-3.5 text-amber-300" />
                  <span>Download Seat Clearance Letter</span>
                </button>
              )}
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residency Status</span>
                <p className="text-2xl font-bold text-[#16324F] mt-2">
                  {user.isResidential ? user.roomNumber || 'Room Assigned' : 'Non-Residential'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {user.isResidential ? `Seat: ${user.seatNumber || 'Standard'}` : 'No active seat allocation'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seat Applications</span>
                <p className="text-2xl font-bold text-[#087E8B] mt-2 font-mono">
                  {applications.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Latest status: {applications[0]?.status || 'None submitted'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Complaints</span>
                <p className="text-2xl font-bold text-[#16803C] mt-2 font-mono">
                  {problems.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Active tickets: {problems.filter(p => p.status !== 'resolved').length}
                </p>
              </div>
            </div>

            {/* Recent Notices Feed */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-[#087E8B]" />
                  <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
                    Recent Official Bulletins & Circulars
                  </h3>
                </div>
                <button
                  onClick={() => setActiveView('notices')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {loadingNotices ? (
                <div className="py-4 text-center text-xs text-slate-500">Loading notices...</div>
              ) : notices.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">No active circulars.</div>
              ) : (
                <div className="space-y-3">
                  {notices.slice(0, 3).map((n) => (
                    <div key={n._id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#087E8B] uppercase tracking-wider">
                          {n.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-[#16324F] mt-0.5">{n.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{n.content}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#16324F] mb-1">Fee Invoices & Payments</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Clear your monthly mess bills and seat allocation fees via verified SSLCommerz payment gateway.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('payments')}
                  className="w-full py-2.5 rounded-md bg-[#087E8B] hover:bg-[#066570] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Open Payment Ledger
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#16324F] mb-1">Room Maintenance Request</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Submit electrical, carpentry, plumbing, or internet tickets directly to hall maintenance staff.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('submit-problem')}
                  className="w-full py-2.5 rounded-md bg-[#16324F] hover:bg-[#10263D] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Report an Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'apply' && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 lg:p-8">
            <h3 className="text-xl font-bold text-[#16324F] mb-2">Hall Seat Application</h3>
            <p className="text-xs text-slate-500 mb-6">
              Submit your academic records and guardian details to apply for residency at Shadhinota Hall.
            </p>
            <ApplicationForm user={user} onSubmit={handleApplicationSubmit} />
          </div>
        )}

        {activeView === 'applications' && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50">
              <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
                My Seat Applications History
              </h3>
            </div>
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                You have not submitted any seat applications yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Program & Year</th>
                      <th className="py-3 px-4">Assigned Room</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id || app._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{app.studentId}</td>
                        <td className="py-3 px-4">{app.program} - {app.year}</td>
                        <td className="py-3 px-4 font-bold text-[#16324F]">
                          {app.assignedRoom ? `${app.assignedRoom} (${app.assignedSeat || 'Standard'})` : 'Pending Allocation'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{app.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeView === 'payments' && (
          <StudentPayments user={user} />
        )}

        {activeView === 'submit-problem' && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 lg:p-8">
            <h3 className="text-xl font-bold text-[#16324F] mb-2">Report Maintenance or Facility Issue</h3>
            <p className="text-xs text-slate-500 mb-6">
              Detail your room problem (electrical, plumbing, carpentry, internet) for rapid staff dispatch.
            </p>
            <ProblemForm user={user} onSubmit={handleProblemSubmit} />
          </div>
        )}

        {activeView === 'problems' && (
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50">
              <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
                My Maintenance Tickets & Progress
              </h3>
            </div>
            {problems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                You have not reported any maintenance issues.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Staff Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {problems.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#16324F]">{p.category}</td>
                        <td className="py-3 px-4">{p.roomNumber}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{p.description}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getStatusColor(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{p.staffRemarks || p.assignedTo ? `Assigned: ${p.assignedTo}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeView === 'notices' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">University Circulars</span>
              <h2 className="text-2xl font-bold text-[#16324F] mt-1">Official Hall Notice Board</h2>
              <p className="text-xs text-slate-500">Authenticated circulars issued by Provost Office, PUST.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notices.map((n) => (
                <div key={n._id} className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                      {n.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#16324F] mb-2">{n.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'account' && (
          <StudentAccount user={user} onNavigateToPayments={() => setActiveView('payments')} />
        )}

        {/* Seat Clearance Letter Modal */}
        {showAllocationLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-6">
                <div className="text-center border-b pb-4 border-slate-200">
                  <h3 className="text-xl font-bold text-[#16324F] uppercase">Pabna University of Science and Technology</h3>
                  <p className="text-xs font-semibold text-[#087E8B]">Office of the Provost • Shadhinota Hall</p>
                  <p className="text-[11px] text-slate-400">Rajapur, Pabna-6600, Bangladesh</p>
                  <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-900 border border-green-300 rounded font-bold text-xs uppercase tracking-wider">
                    Official Residential Seat Allocation Order
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    This is to officially certify that <strong>{user.name}</strong>, Student ID <strong>{user.studentId}</strong> of the Department of <strong>{user.department || 'CSE'}</strong>, has completed the formal seat application and verified fee payment protocols.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500">Allocated Room:</span>
                      <p className="font-bold text-[#16324F] text-sm">{user.roomNumber || 'Room Assigned'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Bed / Seat Designation:</span>
                      <p className="font-bold text-[#16324F] text-sm">{user.seatNumber || 'Standard Seat'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Hall Admission Status:</span>
                      <p className="font-bold text-[#16803C]">Verified & Active</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Academic Session:</span>
                      <p className="font-bold text-[#16324F]">2021-2022</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    The resident student must strictly adhere to university hall rules and disciplinary codes. Room subletting or unauthorized bed transfers are strictly prohibited.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p>Issue Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-[10px] text-slate-400">Ref: PUST/SH/RES/{user.studentId || '2024'}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 mb-1"></div>
                    <p className="font-semibold text-slate-800">Provost, Shadhinota Hall</p>
                    <p className="text-[10px] text-slate-400">PUST</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowAllocationLetter(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold bg-[#16324F] hover:bg-[#10263D] text-white rounded-md flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>Print Allocation Letter</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
