import { useState, useEffect } from 'react';
import { User, Application } from '../App';
import { 
  LogOut, 
  FileText, 
  Home, 
  UserCheck, 
  DoorOpen, 
  RefreshCw, 
  Building2,
  CreditCard,
  Bell,
  BarChart3
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
  onApplicationReview: (updatedApp: any) => void;
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
      console.error('Error fetching users:', err);
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
      setFeedbackSuccess(`Approved ${targetUser.name}`);
      await fetchUsers();
    } catch (err: any) {
      setFeedbackError(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectUser = async (targetUser: any) => {
    const reason = prompt('Rejection reason:', 'Invalid student data');
    if (reason === null) return;
    setRejectingId(targetUser._id);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      await api.put(`/users/${targetUser._id}/reject`, { reason }, user.token);
      setFeedbackSuccess(`Rejected ${targetUser.name}`);
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
      const updated = await api.put(
        `/applications/${selectedApplication.id || selectedApplication._id}`,
        {
          status,
          remarks,
          assignedRoom: assignedRoomInput,
          assignedSeat: assignedSeatInput,
        },
        user.token
      );
      onApplicationReview(updated);
      setSelectedApplication(null);
      setRemarks('');
      setAssignedRoomInput('');
      setAssignedSeatInput('');
    } catch (err: any) {
      alert(err.message || 'Review failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      {/* Sidebar */}
      <aside className="w-56 bg-[#16324F] text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          <div className="p-4 border-b border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#087E8B] flex items-center justify-center text-amber-300">
              <Building2 className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Shadhinota Hall</h2>
              <p className="text-[10px] text-slate-300">Admin Control</p>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#0F2236] border-b border-slate-700/40 text-xs">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-teal-300">Administrator</p>
          </div>

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
              onClick={() => setActiveView('applications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'applications'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="size-4" />
              <span>Seat Requests ({pendingApplications.length})</span>
            </button>

            <button
              onClick={() => setActiveView('approvals')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'approvals'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <UserCheck className="size-4" />
              <span>User Approvals ({pendingUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveView('rooms')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'rooms'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DoorOpen className="size-4" />
              <span>Rooms & Beds</span>
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
              <span>Fees & Invoices</span>
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
              <span>Notices</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'analytics'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart3 className="size-4" />
              <span>Audit Logs</span>
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

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto">
        <div className="mb-4">
          <StudentSearchBar token={user.token} />
        </div>

        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
              <p className="text-xs text-slate-500">Shadhinota Hall • Provost Administration</p>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Applications</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{pendingApplications.length}</p>
                <button
                  onClick={() => setActiveView('applications')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline mt-1 cursor-pointer"
                >
                  Review &rarr;
                </button>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Allocated Seats</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{approvedApplications.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Active residents</p>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Approvals</span>
                <p className="text-2xl font-bold text-amber-700 mt-1 font-mono">{pendingUsers.length}</p>
                <button
                  onClick={() => setActiveView('approvals')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline mt-1 cursor-pointer"
                >
                  Verify &rarr;
                </button>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Rejected</span>
                <p className="text-2xl font-bold text-slate-600 mt-1 font-mono">{rejectedApplications.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Archived</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div 
                onClick={() => setActiveView('rooms')}
                className="bg-white p-4 rounded-md border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <h4 className="font-bold text-slate-900 mb-1">Room Management</h4>
                <p className="text-slate-500">Inspect room occupancy, create rooms, and assign beds.</p>
              </div>

              <div 
                onClick={() => setActiveView('payments')}
                className="bg-white p-4 rounded-md border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <h4 className="font-bold text-slate-900 mb-1">Fee Ledger</h4>
                <p className="text-slate-500">Track verified collections and unpaid student invoices.</p>
              </div>

              <div 
                onClick={() => setActiveView('notices')}
                className="bg-white p-4 rounded-md border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <h4 className="font-bold text-slate-900 mb-1">Notices</h4>
                <p className="text-slate-500">Publish or remove circulars for resident students.</p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'applications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Seat Applications</h3>
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Student ID</th>
                      <th className="py-2.5 px-4">Program</th>
                      <th className="py-2.5 px-4">Contact</th>
                      <th className="py-2.5 px-4">Assigned Bed</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {applications.map((app) => (
                      <tr key={app.id || app._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{app.studentName}</td>
                        <td className="py-2.5 px-4 font-mono">{app.studentId}</td>
                        <td className="py-2.5 px-4">{app.program}</td>
                        <td className="py-2.5 px-4 text-slate-500">{app.phone}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {app.assignedSeat || app.assignedRoom || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setRemarks(app.remarks || '');
                              setAssignedRoomInput(app.assignedRoom || 'B-224');
                              setAssignedSeatInput(app.assignedSeat || 'B-224-C');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#087E8B] hover:bg-[#066570] text-white rounded cursor-pointer"
                          >
                            Review
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">User Registration Approvals</h3>
              <button
                onClick={fetchUsers}
                className="px-2.5 py-1 text-xs text-slate-600 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`size-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {feedbackSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded">
                {feedbackSuccess}
              </div>
            )}

            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
              <div className="p-3 border-b border-slate-200 flex gap-2">
                <button
                  onClick={() => setApprovalsSubTab('students')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    approvalsSubTab === 'students' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending Students ({pendingUsers.filter((u) => u.role === 'student').length})
                </button>
                <button
                  onClick={() => setApprovalsSubTab('staff')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    approvalsSubTab === 'staff' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending Staff ({pendingUsers.filter((u) => u.role === 'staff').length})
                </button>
                <button
                  onClick={() => setApprovalsSubTab('approved')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    approvalsSubTab === 'approved' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Approved Directory ({approvedUsers.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">ID / Dept</th>
                      <th className="py-2.5 px-4">Room</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(approvalsSubTab === 'approved' ? approvedUsers : pendingUsers.filter(u => u.role === (approvalsSubTab === 'staff' ? 'staff' : 'student'))).map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{u.name}</td>
                        <td className="py-2.5 px-4">{u.email}</td>
                        <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-slate-500">{u.role}</td>
                        <td className="py-2.5 px-4 font-mono">{u.studentId || u.department || 'Staff'}</td>
                        <td className="py-2.5 px-4">
                          {approvalsSubTab === 'approved' ? (
                            <span className="font-semibold">{u.roomNumber || 'N/A'}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. B-224"
                              value={roomInputs[u._id] || u.roomNumber || ''}
                              onChange={(e) => setRoomInputs({ ...roomInputs, [u._id]: e.target.value })}
                              className="px-2 py-1 text-xs border rounded border-slate-300 w-24"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          {approvalsSubTab !== 'approved' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(u)}
                                disabled={approvingId === u._id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium cursor-pointer"
                              >
                                {approvingId === u._id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectUser(u)}
                                disabled={rejectingId === u._id}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium cursor-pointer"
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

        {activeView === 'rooms' && <AdminRoomManagement />}
        {activeView === 'payments' && <AdminPaymentManagement />}
        {activeView === 'notices' && <AdminNoticeManagement />}
        {activeView === 'analytics' && <AdminAnalyticsAudit />}

        {/* Modal: Application Review */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-md border border-slate-300 max-w-md w-full p-6 text-xs text-slate-800">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Review: {selectedApplication.studentName}
              </h3>
              <p className="text-slate-500 mb-4">
                ID: {selectedApplication.studentId} • {selectedApplication.program}
              </p>

              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Room</label>
                    <input
                      type="text"
                      value={assignedRoomInput}
                      onChange={(e) => setAssignedRoomInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bed</label>
                    <input
                      type="text"
                      value={assignedSeatInput}
                      onChange={(e) => setAssignedSeatInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                    placeholder="Optional remarks..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewWithSeat('rejected')}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewWithSeat('approved')}
                  className="px-3 py-1.5 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer"
                >
                  Approve & Reserve
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
