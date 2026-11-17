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
  Building2,
  Wrench,
  CheckCircle2
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
  const [assigneeInput, setAssigneeInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Problem['status'] | 'all'>('all');

  // Student Approvals State
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

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const [pending, approved] = await Promise.all([
        api.get('/users/pending', user.token),
        api.get('/users/approved-list', user.token),
      ]);
      setPendingStudents(Array.isArray(pending) ? pending.filter((u) => u.role === 'student') : []);
      setApprovedStudents(Array.isArray(approved) ? approved.filter((u) => u.role === 'student') : []);
    } catch (err: any) {
      console.error('Error fetching students for staff:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeView === 'approvals' || activeView === 'overview') {
      fetchUsers();
    }
  }, [activeView]);

  const handleApproveStudent = async (student: any) => {
    setApprovingId(student._id);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      const roomNumber = roomInputs[student._id] || student.roomNumber || 'Room Assigned';
      await api.put(`/users/${student._id}/approve`, { roomNumber }, user.token);
      setFeedbackSuccess(`Student ${student.name} approved with room ${roomNumber}`);
      await fetchUsers();
    } catch (err: any) {
      setFeedbackError(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectStudent = async (student: any) => {
    const reason = prompt('Specify rejection reason:', 'Invalid student credentials or verification discrepancy');
    if (reason === null) return;
    setRejectingId(student._id);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      await api.put(`/users/${student._id}/reject`, { reason }, user.token);
      setFeedbackSuccess(`Student ${student.name} registration rejected`);
      await fetchUsers();
    } catch (err: any) {
      setFeedbackError(err.message || 'Rejection failed');
    } finally {
      setRejectingId(null);
    }
  };

  const handleProblemStatusChange = async (status: Problem['status']) => {
    if (!selectedProblem || !user.token) return;
    try {
      await api.put(
        `/problems/${selectedProblem.id || selectedProblem._id}`,
        {
          status,
          assignedTo: assigneeInput || selectedProblem.assignedTo,
          staffRemarks: remarks,
        },
        user.token
      );
      onProblemUpdate(selectedProblem.id || selectedProblem._id!, status, remarks);
      setSelectedProblem(null);
      setRemarks('');
      setAssigneeInput('');
    } catch (err: any) {
      alert(err.message || 'Problem update failed');
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] font-sans text-[#1F2937]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#16324F] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#10263D]">
        <div>
          <div className="p-6 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#087E8B] flex items-center justify-center text-amber-300">
                <Wrench className="size-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Staff Portal</h2>
                <p className="text-[11px] text-teal-200">Shadhinota Hall Maintenance</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#10263D]/60 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-amber-300">
                ST
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-300">Operations & Maintenance Staff</p>
              </div>
            </div>
          </div>

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
              <span>Staff Overview</span>
            </button>

            <button
              onClick={() => setActiveView('problems')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors cursor-pointer font-medium ${
                activeView === 'problems'
                  ? 'bg-[#087E8B] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Wrench className="size-4" />
              <span>Complaints & Dispatch ({pendingProblems.length})</span>
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
              <span>Student Verification ({pendingStudents.length})</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out Staff</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto">
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Facility Maintenance</span>
              <h2 className="text-2xl font-bold text-[#16324F] mt-1">Staff Work Order & Ticket Center</h2>
              <p className="text-xs text-slate-500">
                Pabna University of Science and Technology • Shadhinota Hall
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unassigned Issues</span>
                <p className="text-3xl font-extrabold text-amber-700 mt-2 font-mono">
                  {pendingProblems.length}
                </p>
                <button
                  onClick={() => setActiveView('problems')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline mt-2 inline-block cursor-pointer"
                >
                  Manage Complaints &rarr;
                </button>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress Work</span>
                <p className="text-3xl font-extrabold text-blue-700 mt-2 font-mono">
                  {assignedProblems.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">Dispatched to technician</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Tickets</span>
                <p className="text-3xl font-extrabold text-[#16803C] mt-2 font-mono">
                  {resolvedProblems.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">Successfully closed</p>
              </div>
            </div>

            {/* Recent Problem Tickets Feed */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
                  Urgent Student Maintenance Requests
                </h3>
                <button
                  onClick={() => setActiveView('problems')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="p-4 divide-y divide-slate-100">
                {problems.slice(0, 5).map((p) => (
                  <div key={p.id || p._id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#16324F]">{p.category}</span>
                        <span className="text-xs text-slate-500">• Room {p.roomNumber}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{p.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'problems' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Dispatch Desk</span>
              <h2 className="text-2xl font-bold text-[#16324F] mt-1">Maintenance Tickets Management</h2>
              <p className="text-xs text-slate-500">Update repair status, assign internal technicians, and note resolution details.</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by category, room or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Technician Assigned</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredProblems.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#16324F]">{p.studentName}</td>
                        <td className="py-3 px-4 font-semibold">{p.roomNumber}</td>
                        <td className="py-3 px-4">{p.category}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{p.description}</td>
                        <td className="py-3 px-4 text-slate-600">{p.assignedTo || 'Unassigned'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            p.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'in-progress' || p.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProblem(p);
                              setRemarks(p.staffRemarks || '');
                              setAssigneeInput(p.assignedTo || '');
                            }}
                            className="px-3 py-1 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-medium cursor-pointer"
                          >
                            Update
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
                <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Student Verification</span>
                <h2 className="text-2xl font-bold text-[#16324F] mt-1">Student Registration Approval</h2>
                <p className="text-xs text-slate-500">Staff review and room assignment for new student signups.</p>
              </div>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
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
                  onClick={() => setApprovalsSubTab('pending')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    approvalsSubTab === 'pending' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending Students ({pendingStudents.length})
                </button>
                <button
                  onClick={() => setApprovalsSubTab('approved')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    approvalsSubTab === 'approved' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Verified Students ({approvedStudents.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Email & Phone</th>
                      <th className="py-3 px-4">Room Assignment</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(approvalsSubTab === 'approved' ? approvedStudents : pendingStudents).map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-[#16324F]">{s.name}</td>
                        <td className="py-3.5 px-4 font-mono">{s.studentId || 'N/A'}</td>
                        <td className="py-3.5 px-4">{s.department || 'N/A'}</td>
                        <td className="py-3.5 px-4">{s.email} {s.phone ? `(${s.phone})` : ''}</td>
                        <td className="py-3.5 px-4">
                          {approvalsSubTab === 'approved' ? (
                            <span className="font-semibold text-slate-900">{s.roomNumber || 'N/A'}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. B-224"
                              value={roomInputs[s._id] || s.roomNumber || ''}
                              onChange={(e) => setRoomInputs({ ...roomInputs, [s._id]: e.target.value })}
                              className="px-2 py-1 text-xs border rounded border-slate-300 w-28"
                            />
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {approvalsSubTab !== 'approved' && (
                            <>
                              <button
                                onClick={() => handleApproveStudent(s)}
                                disabled={approvingId === s._id}
                                className="px-3 py-1 bg-[#16803C] hover:bg-[#136d33] text-white rounded font-medium cursor-pointer"
                              >
                                {approvingId === s._id ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectStudent(s)}
                                disabled={rejectingId === s._id}
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

        {/* Modal: Update Ticket */}
        {selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-base font-bold text-[#16324F] mb-1">
                Update Ticket: {selectedProblem.category}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Reported by {selectedProblem.studentName} • Room {selectedProblem.roomNumber}
              </p>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-700">
                  <p className="font-medium text-slate-500">Problem Description:</p>
                  <p className="mt-1">{selectedProblem.description}</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Technician / Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician M. Rafiq"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Staff Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Note parts replaced, repairs completed, etc..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  />
                </div>

                <div className="pt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedProblem(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProblemStatusChange('in-progress')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium cursor-pointer"
                  >
                    Mark In-Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProblemStatusChange('resolved')}
                    className="px-3.5 py-1.5 bg-[#16803C] hover:bg-[#136d33] text-white rounded font-semibold cursor-pointer"
                  >
                    Mark Resolved
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
