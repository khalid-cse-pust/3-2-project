import { useState, useEffect } from 'react';
import { User, Problem } from '../App';
import { 
  LogOut, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Home, 
  Search, 
  UserCheck, 
  Users, 
  Mail, 
  Phone, 
  GraduationCap, 
  DoorOpen, 
  RefreshCw,
  XCircle,
  Building2
} from 'lucide-react';
import { api } from '../../api';

interface StaffDashboardProps {
  user: User;
  problems: Problem[];
  onLogout: () => void;
  onProblemUpdate: (id: string, status: Problem['status'], staffRemarks?: string) => void;
}

type ActiveView = 'overview' | 'approvals' | 'problems';

export function StaffDashboard({
  user,
  problems,
  onLogout,
  onProblemUpdate,
}: StaffDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Problem['status'] | 'all'>('all');

  // Approvals State
  const [approvalsSubTab, setApprovalsSubTab] = useState<'pending' | 'approved'>('pending');
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [roomInputs, setRoomInputs] = useState<Record<string, string>>({});
  const [feedbackSuccess, setFeedbackSuccess] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [approvalSearch, setApprovalSearch] = useState<string>('');

  const pendingProblems = problems.filter((p) => p.status === 'pending');
  const assignedProblems = problems.filter((p) => p.status === 'assigned' || p.status === 'in-progress');
  const resolvedProblems = problems.filter((p) => p.status === 'resolved');

  // Fetch pending and approved users
  const fetchUsers = async () => {
    if (!user.token) return;
    setLoadingUsers(true);
    try {
      const [pending, approved] = await Promise.all([
        api.get('/users/pending', user.token),
        api.get('/users/approved-list', user.token),
      ]);
      setPendingStudents(pending);
      setApprovedStudents(approved);

      // Initialize room inputs with requested room numbers
      const initialRooms: Record<string, string> = {};
      pending.forEach((st: any) => {
        initialRooms[st._id] = st.roomNumber || 'A-101';
      });
      setRoomInputs(initialRooms);
    } catch (err: any) {
      console.error('Error fetching users for approval:', err);
      setFeedbackError(err.message || 'Failed to load user approvals');
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
      const res = await api.put(
        `/users/${student._id}/approve`,
        { roomNumber: roomToAssign },
        user.token
      );

      setFeedbackSuccess(
        `Student "${student.name}" approved successfully! Confirmation email sent with Room "${roomToAssign}".`
      );

      // Refresh users list
      await fetchUsers();
    } catch (err: any) {
      console.error('Error approving student:', err);
      setFeedbackError(err.message || 'Failed to approve student');
    } finally {
      setApprovingId(null);
    }
  };

  // Handle Reject Student
  const handleRejectStudent = async (student: any) => {
    if (!user.token) return;
    const confirmReject = window.confirm(`Are you sure you want to reject registration for ${student.name}?`);
    if (!confirmReject) return;

    setRejectingId(student._id);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      await api.put(`/users/${student._id}/reject`, { reason: 'Registration rejected by staff' }, user.token);
      setFeedbackSuccess(`Registration for "${student.name}" has been rejected.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error rejecting student:', err);
      setFeedbackError(err.message || 'Failed to reject student');
    } finally {
      setRejectingId(null);
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || problem.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusUpdate = (status: Problem['status']) => {
    if (selectedProblem) {
      onProblemUpdate(selectedProblem.id, status, remarks || undefined);
      setSelectedProblem(null);
      setRemarks('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredPendingStudents = pendingStudents.filter((st) => {
    const term = approvalSearch.toLowerCase();
    return (
      (st.name || '').toLowerCase().includes(term) ||
      (st.studentId || '').toLowerCase().includes(term) ||
      (st.email || '').toLowerCase().includes(term) ||
      (st.department || '').toLowerCase().includes(term)
    );
  });

  const filteredApprovedStudents = approvedStudents.filter((st) => {
    const term = approvalSearch.toLowerCase();
    return (
      (st.name || '').toLowerCase().includes(term) ||
      (st.studentId || '').toLowerCase().includes(term) ||
      (st.email || '').toLowerCase().includes(term) ||
      (st.roomNumber || '').toLowerCase().includes(term) ||
      (st.department || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-teal-900 text-white flex flex-col shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="size-8 text-teal-300" />
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Shadhinota Hall</h2>
              <p className="text-xs text-teal-300 font-medium">Staff Portal</p>
            </div>
          </div>

          <div className="p-3 bg-teal-800/80 rounded-xl border border-teal-700">
            <p className="text-xs text-teal-200">Logged in as</p>
            <p className="font-semibold text-white truncate text-sm mt-0.5">{user.name}</p>
            <p className="text-xs text-teal-300 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
              activeView === 'overview'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-teal-100 hover:bg-teal-800 hover:text-white'
            }`}
          >
            <Home className="size-4" />
            Overview
          </button>

          {/* Student Approvals Tab - requested explicitly */}
          <button
            onClick={() => {
              setActiveView('approvals');
              fetchUsers();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
              activeView === 'approvals'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-teal-100 hover:bg-teal-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="size-4" />
              <span>Student Approvals</span>
            </div>
            {pendingStudents.length > 0 && (
              <span className="bg-amber-400 text-teal-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingStudents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('problems')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
              activeView === 'problems'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-teal-100 hover:bg-teal-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4" />
              <span>All Problems</span>
            </div>
            {pendingProblems.length > 0 && (
              <span className="bg-red-400 text-teal-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingProblems.length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-teal-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-teal-100 hover:text-white rounded-xl transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* VIEW 1: OVERVIEW */}
        {activeView === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Manage hall problems and student residency approvals</p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => setActiveView('approvals')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Pending Approvals</span>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <UserCheck className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingStudents.length}</p>
                <p className="text-xs text-amber-600 font-medium mt-2">Requires Staff/Admin approval</p>
              </div>

              <div 
                onClick={() => setActiveView('approvals')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Approved Students</span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <CheckCircle className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{approvedStudents.length}</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">Active hall residents</p>
              </div>

              <div 
                onClick={() => setActiveView('problems')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Pending Issues</span>
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <AlertCircle className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{pendingProblems.length}</p>
                <p className="text-xs text-red-600 font-medium mt-2">Maintenance needed</p>
              </div>

              <div 
                onClick={() => setActiveView('problems')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Resolved Issues</span>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Clock className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{resolvedProblems.length}</p>
                <p className="text-xs text-blue-600 font-medium mt-2">Successfully closed</p>
              </div>
            </div>

            {/* Quick Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals Quick View */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="size-5 text-teal-600" />
                    Pending Student Registrations
                  </h2>
                  <button
                    onClick={() => setActiveView('approvals')}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                  >
                    View All ({pendingStudents.length})
                  </button>
                </div>

                {pendingStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle className="size-8 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm">All student registrations have been reviewed!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingStudents.slice(0, 3).map((st) => (
                      <div
                        key={st._id}
                        className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{st.name}</p>
                          <p className="text-xs text-gray-500">ID: {st.studentId || 'N/A'} • {st.department || 'N/A'}</p>
                          <p className="text-xs text-teal-700 mt-1">Requested: {st.roomNumber || 'Room Assigned'}</p>
                        </div>
                        <button
                          onClick={() => setActiveView('approvals')}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg"
                        >
                          Review & Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Problem Reports */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="size-5 text-teal-600" />
                    Recent Problems
                  </h2>
                  <button
                    onClick={() => setActiveView('problems')}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                  >
                    View All ({problems.length})
                  </button>
                </div>

                {pendingProblems.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle className="size-8 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm">No new problems pending.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingProblems.slice(0, 3).map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem)}
                        className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:border-teal-200 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm text-gray-900">{problem.category}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(problem.status)}`}>
                            {problem.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-1">{problem.description}</p>
                        <p className="text-xs text-gray-400">Room: {problem.roomNumber} • {problem.studentName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STUDENT APPROVALS TAB (REQUIRED FEATURE) */}
        {activeView === 'approvals' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="size-7 text-teal-600" />
                  Student Approvals Portal
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Approve registered students, assign room numbers, and trigger official admission emails.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                Refresh List
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
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-0.5">{feedbackError}</p>
                </div>
              </div>
            )}

            {/* Sub-tabs & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setApprovalsSubTab('pending')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    approvalsSubTab === 'pending'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="size-4" />
                  Pending Approvals
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    approvalsSubTab === 'pending' ? 'bg-teal-800 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {pendingStudents.length}
                  </span>
                </button>

                <button
                  onClick={() => setApprovalsSubTab('approved')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    approvalsSubTab === 'approved'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="size-4" />
                  Approved Students
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    approvalsSubTab === 'approved' ? 'bg-teal-800 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {approvedStudents.length}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student, ID, or room..."
                  value={approvalSearch}
                  onChange={(e) => setApprovalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            {/* TAB CONTENT: PENDING STUDENTS */}
            {approvalsSubTab === 'pending' && (
              <div className="space-y-4">
                {filteredPendingStudents.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
                    <CheckCircle className="size-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">No Pending Approvals</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                      All student registration requests have been reviewed. When new students register, they will appear here.
                    </p>
                  </div>
                ) : (
                  filteredPendingStudents.map((student) => {
                    const currentRoom = roomInputs[student._id] ?? (student.roomNumber || 'A-101');
                    const isApproving = approvingId === student._id;
                    const isRejecting = rejectingId === student._id;

                    return (
                      <div
                        key={student._id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-teal-300 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          
                          {/* Student Details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                Pending Approval
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 pt-1">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="size-4 text-teal-600" />
                                <span>ID: <strong className="text-gray-800">{student.studentId || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-teal-600" />
                                <span>Dept: <strong className="text-gray-800">{student.department || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="size-4 text-teal-600" />
                                <span className="truncate">{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="size-4 text-teal-600" />
                                <span>{student.phone || 'N/A'}</span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-400 pt-1">
                              Registration Date: {new Date(student.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Room Number Assignment & Actions */}
                          <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div>
                              <label className="block text-xs font-bold text-teal-900 mb-1 flex items-center gap-1">
                                <DoorOpen className="size-3.5" />
                                Assign Room Number:
                              </label>
                              <input
                                type="text"
                                value={currentRoom}
                                onChange={(e) =>
                                  setRoomInputs({ ...roomInputs, [student._id]: e.target.value })
                                }
                                placeholder="e.g., B-224"
                                className="px-3 py-1.5 border border-teal-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none w-full sm:w-36"
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
                                    Approve & Send Mail
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleRejectStudent(student)}
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

            {/* TAB CONTENT: APPROVED STUDENTS */}
            {approvalsSubTab === 'approved' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Student ID</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Room Number</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Approved At</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredApprovedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            No approved students found.
                          </td>
                        </tr>
                      ) : (
                        filteredApprovedStudents.map((st) => (
                          <tr key={st._id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900">{st.name}</td>
                            <td className="px-6 py-4 font-mono text-gray-700">{st.studentId || 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-600">{st.department || 'N/A'}</td>
                            <td className="px-6 py-4 font-semibold text-teal-800">
                              <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md">
                                {st.roomNumber || 'Assigned'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600">
                              <p>{st.email}</p>
                              {st.phone && <p className="text-gray-400 mt-0.5">{st.phone}</p>}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {st.approvedAt ? new Date(st.approvedAt).toLocaleDateString() : 'Active'}
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

        {/* VIEW 3: ALL PROBLEMS */}
        {activeView === 'problems' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Maintenance & Problems</h1>

            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, room, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'assigned', 'in-progress', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredProblems.map((problem) => (
                <div key={problem.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="size-5 text-teal-600" />
                        <h3 className="font-bold text-gray-900">{problem.category}</h3>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(problem.status)}`}>
                          {problem.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Room: <strong className="text-gray-900">{problem.roomNumber}</strong> • Student: {problem.studentName}
                      </p>
                      <p className="text-gray-700 text-sm mb-2">{problem.description}</p>
                      {problem.image && (
                        <div className="my-3">
                          <img
                            src={problem.image}
                            alt="Problem"
                            className="max-h-48 rounded-lg object-contain border border-gray-200"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        Submitted: {new Date(problem.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProblem(problem)}
                      className="ml-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))}

              {filteredProblems.length === 0 && (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                  <AlertCircle className="size-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No problems found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Problem Update Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Update Problem Status</h2>
                <span className={`px-2 py-0.5 rounded text-xs mt-1 inline-block ${getStatusColor(selectedProblem.status)}`}>
                  Current: {selectedProblem.status}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedProblem(null);
                  setRemarks('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                <p><strong>Category:</strong> {selectedProblem.category}</p>
                <p><strong>Room:</strong> {selectedProblem.roomNumber}</p>
                <p><strong>Student:</strong> {selectedProblem.studentName}</p>
                <p><strong>Description:</strong> {selectedProblem.description}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Staff Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                  placeholder="Notes on resolution or progress..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {selectedProblem.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('assigned')}
                    className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Assign to Me
                  </button>
                )}
                {selectedProblem.status !== 'in-progress' && (
                  <button
                    onClick={() => handleStatusUpdate('in-progress')}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedProblem.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold col-span-2"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
