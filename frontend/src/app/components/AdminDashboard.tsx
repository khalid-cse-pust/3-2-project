import { useState, useEffect } from 'react';
import { User, Application } from '../App';
import { 
  LogOut, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Home, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Mail, 
  Phone, 
  GraduationCap, 
  DoorOpen, 
  Clock, 
  Search, 
  RefreshCw, 
  Building2,
  Briefcase,
  CreditCard,
  Bell,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { StudentSearchBar } from './StudentSearchBar';
import { AdminRoomManagement } from './AdminRoomManagement';
import { AdminPaymentManagement } from './AdminPaymentManagement';
import { AdminNoticeManagement } from './AdminNoticeManagement';
import { AdminAnalyticsAudit } from './AdminAnalyticsAudit';
import { api } from '../../api';

interface AdminDashboardProps {
  user: User;
  applications: Application[];
  onLogout: () => void;
  onApplicationReview: (id: string, status: 'approved' | 'rejected', remarks: string) => void;
}

type ActiveView = 'overview' | 'applications' | 'approvals' | 'rooms' | 'payments' | 'notices' | 'analytics';

export function AdminDashboard({
  user,
  applications,
  onLogout,
  onApplicationReview,
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState('');
  const [assignedRoomInput, setAssignedRoomInput] = useState('');
  const [assignedSeatInput, setAssignedSeatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // User Approvals State
  const [approvalsSubTab, setApprovalsSubTab] = useState<'students' | 'staff' | 'approved'>('students');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [roomInputs, setRoomInputs] = useState<Record<string, string>>({});
  const [feedbackSuccess, setFeedbackSuccess] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const approvedApplications = applications.filter((app) => app.status === 'approved' || app.status === 'allocated');
  const rejectedApplications = applications.filter((app) => app.status === 'rejected');

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const [pending, approved] = await Promise.all([
        api.get('/users/pending', user.token),
        api.get('/users/approved-list', user.token),
      ]);
      setPendingUsers(Array.isArray(pending) ? pending : []);
      setApprovedUsers(Array.isArray(approved) ? approved : []);
    } catch (err: any) {
      console.error('Error fetching users for admin approvals:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeView === 'approvals' || activeView === 'overview') {
      fetchUsers();
    }
  }, [activeView]);

  const handleApproveUser = async (targetUser: any) => {
    setApprovingId(targetUser._id);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      const roomNumber = roomInputs[targetUser._id] || targetUser.roomNumber || 'Room Assigned';
      await api.put(`/users/${targetUser._id}/approve`, { roomNumber }, user.token);
      setFeedbackSuccess(`Successfully approved ${targetUser.name} (${targetUser.role})`);
      await fetchUsers();
    } catch (err: any) {
      setFeedbackError(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectUser = async (targetUser: any) => {
    const reason = prompt('Please specify a rejection reason:', 'Incomplete verification or duplicate submission');
    if (reason === null) return;
    setRejectingId(targetUser._id);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      await api.put(`/users/${targetUser._id}/reject`, { reason }, user.token);
      setFeedbackSuccess(`Rejected registration for ${targetUser.name}`);
      await fetchUsers();
    } catch (err: any) {
      setFeedbackError(err.message || 'Rejection failed');
    } finally {
      setRejectingId(null);
    }
  };

  const handleReviewWithSeat = async (status: 'approved' | 'rejected') => {
    if (!selectedApplication || !user.token) return;
    try {
      await api.put(
        `/applications/${selectedApplication.id || selectedApplication._id}`,
        {
          status,
          remarks,
          assignedRoom: assignedRoomInput,
          assignedSeat: assignedSeatInput,
        },
        user.token
      );
      onApplicationReview(
        selectedApplication.id || selectedApplication._id!,
        status,
        remarks
      );
      setSelectedApplication(null);
      setRemarks('');
      setAssignedRoomInput('');
      setAssignedSeatInput('');
    } catch (err: any) {
      alert(err.message || 'Application review failed');
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
                <p className="text-[11px] text-teal-200">Provost Administrative Control</p>
              </div>
            </div>
          </div>

          {/* Admin Mini Profile */}
          <div className="px-6 py-4 bg-[#10263D]/60 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#087E8B] flex items-center justify-center font-bold text-xs text-white border border-teal-400">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-teal-200">System Administrator</p>
                <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Full Access
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
              <span>Provost Dashboard</span>
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
              <span>Seat Applications ({pendingApplications.length})</span>
            </button>

            <button
              onClick={() => setActiveView('approvals')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'approvals'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <UserCheck className="size-4" />
              <span>Registration Approvals</span>
            </button>

            <button
              onClick={() => setActiveView('rooms')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'rooms'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <DoorOpen className="size-4" />
              <span>Room & Seat Management</span>
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
              <span>Fees & Invoices (SSLCommerz)</span>
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
              <span>Notice Bulletins</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'analytics'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <BarChart3 className="size-4" />
              <span>Occupancy & Audit Logs</span>
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
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Fast Student Verification Search Bar */}
        <div className="mb-6">
          <StudentSearchBar />
        </div>

        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Institutional Operations</span>
              <h2 className="text-2xl font-bold text-[#16324F] mt-1">Provost Administrative Control Center</h2>
              <p className="text-xs text-slate-500">
                Pabna University of Science and Technology • Shadhinota Hall Management Dashboard
              </p>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Seat Requests</span>
                <p className="text-3xl font-extrabold text-[#16324F] mt-2 font-mono">
                  {pendingApplications.length}
                </p>
                <button
                  onClick={() => setActiveView('applications')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline mt-2 inline-block cursor-pointer"
                >
                  Review Applications &rarr;
                </button>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Allocations</span>
                <p className="text-3xl font-extrabold text-[#16803C] mt-2 font-mono">
                  {approvedApplications.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">Active residential students</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Approvals</span>
                <p className="text-3xl font-extrabold text-amber-700 mt-2 font-mono">
                  {pendingUsers.length}
                </p>
                <button
                  onClick={() => setActiveView('approvals')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline mt-2 inline-block cursor-pointer"
                >
                  Manage Users &rarr;
                </button>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Requests</span>
                <p className="text-3xl font-extrabold text-slate-600 mt-2 font-mono">
                  {rejectedApplications.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">Archived applications</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveView('rooms')}
                className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm hover:border-[#087E8B] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded bg-[#087E8B]/10 text-[#087E8B] flex items-center justify-center mb-3">
                  <DoorOpen className="size-5" />
                </div>
                <h4 className="font-bold text-[#16324F] text-base mb-1">Room & Bed Inventory</h4>
                <p className="text-xs text-slate-500">
                  Inspect room occupancies, assign beds, create rooms, and vacate alumni students.
                </p>
              </div>

              <div 
                onClick={() => setActiveView('payments')}
                className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm hover:border-[#087E8B] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded bg-green-50 text-[#16803C] flex items-center justify-center mb-3">
                  <CreditCard className="size-5" />
                </div>
                <h4 className="font-bold text-[#16324F] text-base mb-1">Fee Management</h4>
                <p className="text-xs text-slate-500">
                  View SSLCommerz verified transactions, invoice balances, and generate fee bills.
                </p>
              </div>

              <div 
                onClick={() => setActiveView('notices')}
                className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm hover:border-[#087E8B] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Bell className="size-5" />
                </div>
                <h4 className="font-bold text-[#16324F] text-base mb-1">Institutional Bulletins</h4>
                <p className="text-xs text-slate-500">
                  Publish notices, dining announcements, and administrative guidelines for students.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'applications' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Seat Allocation Engine</span>
                <h2 className="text-2xl font-bold text-[#16324F] mt-1">Review Student Applications</h2>
                <p className="text-xs text-slate-500">Inspect academic credentials, assign room and bed, and approve allocation order.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Program & Year</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Assigned Bed</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {applications.map((app) => (
                      <tr key={app.id || app._id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-[#16324F]">{app.studentName}</td>
                        <td className="py-3.5 px-4 font-mono">{app.studentId}</td>
                        <td className="py-3.5 px-4">{app.program} • {app.year}</td>
                        <td className="py-3.5 px-4">{app.phone}</td>
                        <td className="py-3.5 px-4 font-semibold text-teal-800">
                          {app.assignedSeat || app.assignedRoom || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            app.status === 'approved' || app.status === 'allocated'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setRemarks(app.remarks || '');
                              setAssignedRoomInput(app.assignedRoom || 'B-224');
                              setAssignedSeatInput(app.assignedSeat || 'B-224-C');
                            }}
                            className="px-3 py-1 text-xs font-semibold bg-[#087E8B] hover:bg-[#066570] text-white rounded cursor-pointer"
                          >
                            Review & Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'approvals' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Institutional Identity</span>
                <h2 className="text-2xl font-bold text-[#16324F] mt-1">Student & Staff Registration Approvals</h2>
                <p className="text-xs text-slate-500">Verify newly registered students and hall staff before granting portal access.</p>
              </div>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            {feedbackSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md">
                {feedbackSuccess}
              </div>
            )}
            {feedbackError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
                {feedbackError}
              </div>
            )}

            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex gap-2">
                <button
                  onClick={() => setApprovalsSubTab('students')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    approvalsSubTab === 'students' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending Students ({pendingUsers.filter((u) => u.role === 'student').length})
                </button>
                <button
                  onClick={() => setApprovalsSubTab('staff')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    approvalsSubTab === 'staff' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending Staff ({pendingUsers.filter((u) => u.role === 'staff').length})
                </button>
                <button
                  onClick={() => setApprovalsSubTab('approved')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    approvalsSubTab === 'approved' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Approved Directory ({approvedUsers.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">ID / Dept</th>
                      <th className="py-3 px-4">Assigned Room</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(approvalsSubTab === 'approved' ? approvedUsers : pendingUsers.filter(u => u.role === (approvalsSubTab === 'staff' ? 'staff' : 'student'))).map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-[#16324F]">{u.name}</td>
                        <td className="py-3.5 px-4">{u.email}</td>
                        <td className="py-3.5 px-4 uppercase text-[10px] font-bold">{u.role}</td>
                        <td className="py-3.5 px-4 font-mono">{u.studentId || u.department || 'Staff Member'}</td>
                        <td className="py-3.5 px-4">
                          {approvalsSubTab === 'approved' ? (
                            <span className="font-semibold text-slate-900">{u.roomNumber || 'N/A'}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. B-224"
                              value={roomInputs[u._id] || u.roomNumber || ''}
                              onChange={(e) => setRoomInputs({ ...roomInputs, [u._id]: e.target.value })}
                              className="px-2 py-1 text-xs border rounded border-slate-300 w-28"
                            />
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {approvalsSubTab !== 'approved' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(u)}
                                disabled={approvingId === u._id}
                                className="px-3 py-1 bg-[#16803C] hover:bg-[#136d33] text-white rounded font-medium cursor-pointer"
                              >
                                {approvingId === u._id ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectUser(u)}
                                disabled={rejectingId === u._id}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'rooms' && (
          <AdminRoomManagement />
        )}

        {activeView === 'payments' && (
          <AdminPaymentManagement />
        )}

        {activeView === 'notices' && (
          <AdminNoticeManagement />
        )}

        {activeView === 'analytics' && (
          <AdminAnalyticsAudit />
        )}

        {/* Modal: Application Review & Room Assignment */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-lg font-bold text-[#16324F] mb-1">
                Seat Review: {selectedApplication.studentName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Student ID: {selectedApplication.studentId} • Department: {selectedApplication.program} ({selectedApplication.year})
              </p>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-slate-700">
                  <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                  <p><strong>Guardian:</strong> {selectedApplication.guardianName} ({selectedApplication.guardianPhone})</p>
                  <p><strong>Address:</strong> {selectedApplication.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Room Assignment</label>
                    <input
                      type="text"
                      placeholder="e.g. B-224"
                      value={assignedRoomInput}
                      onChange={(e) => setAssignedRoomInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bed Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. B-224-C"
                      value={assignedSeatInput}
                      onChange={(e) => setAssignedSeatInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Administrative Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Enter approval remarks or reason for rejection..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewWithSeat('rejected')}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewWithSeat('approved')}
                    className="px-4 py-2 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer"
                  >
                    Approve & Reserve Seat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
