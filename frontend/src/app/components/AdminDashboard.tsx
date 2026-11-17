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
  Briefcase
} from 'lucide-react';
import { StudentSearchBar } from './StudentSearchBar';
import { api } from '../../api';

interface AdminDashboardProps {
  user: User;
  applications: Application[];
  onLogout: () => void;
  onApplicationReview: (id: string, status: 'approved' | 'rejected', remarks: string) => void;
}

type ActiveView = 'overview' | 'applications' | 'approvals';

export function AdminDashboard({
  user,
  applications,
  onLogout,
  onApplicationReview,
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState('');
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
  const approvedApplications = applications.filter((app) => app.status === 'approved');
  const rejectedApplications = applications.filter((app) => app.status === 'rejected');

  const pendingStudents = pendingUsers.filter((u) => u.role === 'student');
  const pendingStaff = pendingUsers.filter((u) => u.role === 'staff');

  // Fetch pending and approved users
  const fetchUsers = async () => {
    if (!user.token) return;
    setLoadingUsers(true);
    try {
      const [pending, approved] = await Promise.all([
        api.get('/users/pending', user.token),
        api.get('/users/approved-list', user.token),
      ]);
      setPendingUsers(pending);
      setApprovedUsers(approved);

      const initialRooms: Record<string, string> = {};
      pending.forEach((u: any) => {
        if (u.role === 'student') {
          initialRooms[u._id] = u.roomNumber || 'A-101';
        }
      });
      setRoomInputs(initialRooms);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setFeedbackError(err.message || 'Failed to fetch user approvals');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user.token]);

  // Handle Approve Student
  const handleApproveStudent = async (student: any) => {
    if (!user.token) return;
    const roomToAssign = (roomInputs[student._id] || student.roomNumber || 'A-101').trim();

    if (!roomToAssign) {
      setFeedbackError('Please specify a room number for the student');
      return;
    }

    setApprovingId(student._id);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      await api.put(`/users/${student._id}/approve`, { roomNumber: roomToAssign }, user.token);
      setFeedbackSuccess(
        `Student "${student.name}" approved! Official confirmation email sent with Room "${roomToAssign}".`
      );
      await fetchUsers();
    } catch (err: any) {
      console.error('Error approving student:', err);
      setFeedbackError(err.message || 'Failed to approve student');
    } finally {
      setApprovingId(null);
    }
  };

  // Handle Approve Staff (Admin Only Feature)
  const handleApproveStaff = async (staffMember: any) => {
    if (!user.token) return;

    setApprovingId(staffMember._id);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      await api.put(`/users/${staffMember._id}/approve`, {}, user.token);
      setFeedbackSuccess(`Staff member "${staffMember.name}" has been approved by Admin! Notification email sent.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error approving staff:', err);
      setFeedbackError(err.message || 'Failed to approve staff');
    } finally {
      setApprovingId(null);
    }
  };

  // Handle Reject User
  const handleRejectUser = async (targetUser: any) => {
    if (!user.token) return;
    const confirm = window.confirm(`Are you sure you want to reject registration for ${targetUser.name}?`);
    if (!confirm) return;

    setRejectingId(targetUser._id);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      await api.put(`/users/${targetUser._id}/reject`, { reason: 'Rejected by admin' }, user.token);
      setFeedbackSuccess(`Registration for "${targetUser.name}" has been rejected.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error rejecting user:', err);
      setFeedbackError(err.message || 'Failed to reject user');
    } finally {
      setRejectingId(null);
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReview = (status: 'approved' | 'rejected') => {
    if (selectedApplication && remarks.trim()) {
      onApplicationReview(selectedApplication.id || (selectedApplication as any)._id, status, remarks);
      setSelectedApplication(null);
      setRemarks('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredPendingStudents = pendingStudents.filter((st) => {
    const term = userSearchTerm.toLowerCase();
    return (
      (st.name || '').toLowerCase().includes(term) ||
      (st.studentId || '').toLowerCase().includes(term) ||
      (st.email || '').toLowerCase().includes(term) ||
      (st.department || '').toLowerCase().includes(term)
    );
  });

  const filteredPendingStaff = pendingStaff.filter((st) => {
    const term = userSearchTerm.toLowerCase();
    return (
      (st.name || '').toLowerCase().includes(term) ||
      (st.email || '').toLowerCase().includes(term) ||
      (st.department || '').toLowerCase().includes(term) ||
      (st.phone || '').toLowerCase().includes(term)
    );
  });

  const filteredApprovedUsers = approvedUsers.filter((u) => {
    const term = userSearchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.studentId || '').toLowerCase().includes(term) ||
      (u.roomNumber || '').toLowerCase().includes(term) ||
      (u.department || '').toLowerCase().includes(term) ||
      (u.role || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-purple-950 text-white flex flex-col shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="size-8 text-purple-300" />
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Shadhinota Hall</h2>
              <p className="text-xs text-purple-300 font-medium">Admin Portal</p>
            </div>
          </div>

          <div className="p-3 bg-purple-900/80 rounded-xl border border-purple-800">
            <p className="text-xs text-purple-300">Logged in as</p>
            <p className="font-semibold text-white truncate text-sm mt-0.5">{user.name}</p>
            <p className="text-xs text-purple-400 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
              activeView === 'overview'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900 hover:text-white'
            }`}
          >
            <Home className="size-4" />
            Overview
          </button>

          {/* User Approvals Tab */}
          <button
            onClick={() => {
              setActiveView('approvals');
              fetchUsers();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
              activeView === 'approvals'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="size-4" />
              <span>User Approvals</span>
            </div>
            {pendingUsers.length > 0 && (
              <span className="bg-amber-400 text-purple-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('applications')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
              activeView === 'applications'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-purple-200 hover:bg-purple-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="size-4" />
              <span>Seat Applications</span>
            </div>
            {pendingApplications.length > 0 && (
              <span className="bg-purple-400 text-purple-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-purple-900">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-900 hover:bg-purple-850 text-purple-200 hover:text-white rounded-xl transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <StudentSearchBar token={user.token} />

        {/* VIEW 1: OVERVIEW */}
        {activeView === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Full administrative control of Shadhinota Hall</p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => {
                  setActiveView('approvals');
                  setApprovalsSubTab('students');
                }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Pending Students</span>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <GraduationCap className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingStudents.length}</p>
                <p className="text-xs text-amber-600 font-medium mt-2">Awaiting approval & room</p>
              </div>

              <div 
                onClick={() => {
                  setActiveView('approvals');
                  setApprovalsSubTab('staff');
                }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Pending Staff</span>
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Briefcase className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingStaff.length}</p>
                <p className="text-xs text-purple-600 font-medium mt-2">Requires Admin approval</p>
              </div>

              <div 
                onClick={() => setActiveView('applications')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Seat Applications</span>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FileText className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingApplications.length}</p>
                <p className="text-xs text-blue-600 font-medium mt-2">Applications to review</p>
              </div>

              <div 
                onClick={() => {
                  setActiveView('approvals');
                  setApprovalsSubTab('approved');
                }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Approved Users</span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <CheckCircle className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{approvedUsers.length}</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">Students & staff</p>
              </div>
            </div>

            {/* Quick Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals Widget */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="size-5 text-purple-600" />
                    Pending User Registrations
                  </h2>
                  <button
                    onClick={() => setActiveView('approvals')}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    View Approvals ({pendingUsers.length})
                  </button>
                </div>

                {pendingUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle className="size-8 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm">No pending user registrations!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.slice(0, 4).map((u) => (
                      <div
                        key={u._id}
                        className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                              u.role === 'staff' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveView('approvals');
                            setApprovalsSubTab(u.role === 'staff' ? 'staff' : 'students');
                          }}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-850 text-white text-xs font-medium rounded-lg cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Seat Applications Widget */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="size-5 text-purple-600" />
                    Pending Seat Applications
                  </h2>
                  <button
                    onClick={() => setActiveView('applications')}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    View All ({pendingApplications.length})
                  </button>
                </div>

                {pendingApplications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle className="size-8 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm">No pending seat applications.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApplications.slice(0, 4).map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApplication(app)}
                        className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:border-purple-200 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{app.studentName}</p>
                          <p className="text-xs text-gray-500">{app.program} • {app.year}</p>
                        </div>
                        <button className="px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-lg">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: USER APPROVALS (STUDENTS + STAFF) */}
        {activeView === 'approvals' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="size-7 text-purple-600" />
                  User Approvals Management
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Approve student registrations with room allocations and review staff account permissions.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Notifications */}
            {feedbackSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Success</p>
                  <p className="text-sm text-emerald-700 mt-0.5">{feedbackSuccess}</p>
                </div>
              </div>
            )}

            {feedbackError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-0.5">{feedbackError}</p>
                </div>
              </div>
            )}

            {/* Filter Tabs & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setApprovalsSubTab('students')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    approvalsSubTab === 'students'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <GraduationCap className="size-4" />
                  Pending Students
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    approvalsSubTab === 'students' ? 'bg-purple-900 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pendingStudents.length}
                  </span>
                </button>

                <button
                  onClick={() => setApprovalsSubTab('staff')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    approvalsSubTab === 'staff'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Briefcase className="size-4" />
                  Pending Staff (Admin Approval)
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    approvalsSubTab === 'staff' ? 'bg-purple-900 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pendingStaff.length}
                  </span>
                </button>

                <button
                  onClick={() => setApprovalsSubTab('approved')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    approvalsSubTab === 'approved'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="size-4" />
                  Approved Users
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    approvalsSubTab === 'approved' ? 'bg-purple-900 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {approvedUsers.length}
                  </span>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* SUB-TAB 1: PENDING STUDENTS */}
            {approvalsSubTab === 'students' && (
              <div className="space-y-4">
                {filteredPendingStudents.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
                    <CheckCircle className="size-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">No Pending Students</h3>
                    <p className="text-gray-500 text-sm mt-1">All student accounts are currently approved.</p>
                  </div>
                ) : (
                  filteredPendingStudents.map((student) => {
                    const currentRoom = roomInputs[student._id] ?? (student.roomNumber || 'A-101');
                    const isApproving = approvingId === student._id;
                    const isRejecting = rejectingId === student._id;

                    return (
                      <div
                        key={student._id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                Student
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 pt-1">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="size-4 text-purple-600" />
                                <span>ID: <strong className="text-gray-800">{student.studentId || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-purple-600" />
                                <span>Dept: <strong className="text-gray-800">{student.department || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="size-4 text-purple-600" />
                                <span className="truncate">{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="size-4 text-purple-600" />
                                <span>{student.phone || 'N/A'}</span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-400 pt-1">
                              Registered: {new Date(student.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Room Assignment & Actions */}
                          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div>
                              <label className="block text-xs font-bold text-purple-900 mb-1 flex items-center gap-1">
                                <DoorOpen className="size-3.5" />
                                Room Number:
                              </label>
                              <input
                                type="text"
                                value={currentRoom}
                                onChange={(e) =>
                                  setRoomInputs({ ...roomInputs, [student._id]: e.target.value })
                                }
                                placeholder="e.g., B-224"
                                className="px-3 py-1.5 border border-purple-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-36"
                              />
                            </div>

                            <div className="flex gap-2 sm:pt-4">
                              <button
                                onClick={() => handleApproveStudent(student)}
                                disabled={isApproving || isRejecting}
                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isApproving ? (
                                  <>
                                    <RefreshCw className="size-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="size-4" />
                                    Approve & Email
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleRejectUser(student)}
                                disabled={isApproving || isRejecting}
                                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 border border-red-200"
                              >
                                <XCircle className="size-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SUB-TAB 2: PENDING STAFF (ADMIN APPROVAL REQUIRED) */}
            {approvalsSubTab === 'staff' && (
              <div className="space-y-4">
                {filteredPendingStaff.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
                    <CheckCircle className="size-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">No Pending Staff Accounts</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      All staff registration requests have been reviewed and approved.
                    </p>
                  </div>
                ) : (
                  filteredPendingStaff.map((staffMember) => {
                    const isApproving = approvingId === staffMember._id;
                    const isRejecting = rejectingId === staffMember._id;

                    return (
                      <div
                        key={staffMember._id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 hover:border-purple-400 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{staffMember.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                Staff Member
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 pt-1">
                              <div className="flex items-center gap-2">
                                <Briefcase className="size-4 text-purple-600" />
                                <span>Dept / Role: <strong>{staffMember.department || 'Staff'}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="size-4 text-purple-600" />
                                <span className="truncate">{staffMember.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="size-4 text-purple-600" />
                                <span>{staffMember.phone || 'N/A'}</span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-400 pt-1">
                              Registered: {new Date(staffMember.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveStaff(staffMember)}
                              disabled={isApproving || isRejecting}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isApproving ? (
                                <>
                                  <RefreshCw className="size-4 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="size-4" />
                                  Approve Staff
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleRejectUser(staffMember)}
                              disabled={isApproving || isRejecting}
                              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-50 border border-red-200"
                            >
                              <XCircle className="size-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SUB-TAB 3: ALL APPROVED USERS */}
            {approvalsSubTab === 'approved' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Student ID / Dept</th>
                        <th className="px-6 py-4">Room Number</th>
                        <th className="px-6 py-4">Email / Phone</th>
                        <th className="px-6 py-4">Approved At</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredApprovedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            No approved users found.
                          </td>
                        </tr>
                      ) : (
                        filteredApprovedUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900">{u.name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                                u.role === 'staff'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {u.studentId ? `ID: ${u.studentId}` : u.department || 'N/A'}
                            </td>
                            <td className="px-6 py-4 font-semibold text-purple-800">
                              {u.roomNumber ? (
                                <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-xs">
                                  {u.roomNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400 font-normal text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600">
                              <p>{u.email}</p>
                              {u.phone && <p className="text-gray-400">{u.phone}</p>}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : 'Active'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Approved
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SEAT APPLICATIONS */}
        {activeView === 'applications' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Hall Seat Applications</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Filter applications by name, email, or program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Program</th>
                      <th className="px-6 py-3">Year</th>
                      <th className="px-6 py-3">Submitted</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-900">{app.studentName}</td>
                        <td className="px-6 py-4 text-gray-600">{app.program}</td>
                        <td className="px-6 py-4 text-gray-600">{app.year}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="text-purple-600 hover:text-purple-800 text-xs font-semibold cursor-pointer"
                          >
                            Review Details
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
      </div>

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Application Review</h2>
                <span className={`px-2 py-0.5 rounded text-xs mt-1 inline-block ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setRemarks('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="font-semibold text-gray-800">{selectedApplication.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="font-semibold text-gray-800">{selectedApplication.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-800">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-800">{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Program / Dept</p>
                  <p className="text-gray-800">{selectedApplication.program} ({selectedApplication.year})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Guardian Phone</p>
                  <p className="text-gray-800">{selectedApplication.guardianName} ({selectedApplication.guardianPhone})</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admin Remarks / Notes
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  rows={3}
                  placeholder="Provide decision remarks..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReview('approved')}
                  disabled={!remarks.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => handleReview('rejected')}
                  disabled={!remarks.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
