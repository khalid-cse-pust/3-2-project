import { useState, useEffect } from 'react';
import { User, Problem } from '../App';
import { 
  LogOut, 
  Wrench, 
  Home, 
  Search, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../api';

interface StaffDashboardProps {
  user: User;
  problems: Problem[];
  onLogout: () => void;
  onProblemUpdate: (updatedProblem: any) => void;
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
      console.error('Error fetching students:', err);
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
      setFeedbackSuccess(`Approved ${student.name}`);
      await fetchUsers();
    } catch (err: any) {
      setFeedbackError(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectStudent = async (student: any) => {
    const reason = prompt('Rejection reason:', 'Discrepancy');
    if (reason === null) return;
    setRejectingId(student._id);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      await api.put(`/users/${student._id}/reject`, { reason }, user.token);
      setFeedbackSuccess(`Rejected ${student.name}`);
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
      const updated = await api.put(
        `/problems/${selectedProblem.id || selectedProblem._id}`,
        {
          status,
          assignedTo: assigneeInput || selectedProblem.assignedTo,
          staffRemarks: remarks,
        },
        user.token
      );
      onProblemUpdate(updated);
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
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      {/* Sidebar */}
      <aside className="w-56 bg-[#16324F] text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          <div className="p-4 border-b border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#087E8B] flex items-center justify-center text-amber-300">
              <Wrench className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Staff Portal</h2>
              <p className="text-[10px] text-slate-300">Hall Maintenance</p>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#0F2236] border-b border-slate-700/40 text-xs">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400">Staff</p>
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
              onClick={() => setActiveView('problems')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors cursor-pointer ${
                activeView === 'problems'
                  ? 'bg-[#087E8B] text-white font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Wrench className="size-4" />
              <span>Complaints ({pendingProblems.length})</span>
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
              <span>Student Approvals ({pendingStudents.length})</span>
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
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Staff Dashboard</h2>
              <p className="text-xs text-slate-500">Hall Maintenance & Repair Work Orders</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Unassigned Issues</span>
                <p className="text-2xl font-bold text-amber-700 mt-1 font-mono">{pendingProblems.length}</p>
                <button
                  onClick={() => setActiveView('problems')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline mt-1 cursor-pointer"
                >
                  View Tickets &rarr;
                </button>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">In Progress</span>
                <p className="text-2xl font-bold text-sky-700 mt-1 font-mono">{assignedProblems.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Under repair</p>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Resolved</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{resolvedProblems.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Closed issues</p>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Complaints</h4>
                <button
                  onClick={() => setActiveView('problems')}
                  className="text-xs font-semibold text-[#087E8B] hover:underline cursor-pointer"
                >
                  All Tickets &rarr;
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {problems.slice(0, 4).map((p) => (
                  <div key={p.id || p._id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.category} • Room {p.roomNumber}</p>
                      <p className="text-slate-500 line-clamp-1">{p.description}</p>
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Complaints</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search room or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded w-48 focus:outline-none"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Room</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4">Assigned To</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredProblems.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{p.studentName}</td>
                        <td className="py-2.5 px-4 font-semibold">{p.roomNumber}</td>
                        <td className="py-2.5 px-4">{p.category}</td>
                        <td className="py-2.5 px-4 max-w-xs truncate text-slate-600">{p.description}</td>
                        <td className="py-2.5 px-4 text-slate-500">{p.assignedTo || '-'}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProblem(p);
                              setRemarks(p.staffRemarks || '');
                              setAssigneeInput(p.assignedTo || '');
                            }}
                            className="px-2.5 py-1 bg-[#087E8B] hover:bg-[#066570] text-white rounded text-xs font-semibold cursor-pointer"
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Student Approvals</h3>
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
                  onClick={() => setApprovalsSubTab('pending')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    approvalsSubTab === 'pending' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pending ({pendingStudents.length})
                </button>
                <button
                  onClick={() => setApprovalsSubTab('approved')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    approvalsSubTab === 'approved' ? 'bg-[#16324F] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Approved ({approvedStudents.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Student ID</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4">Email / Phone</th>
                      <th className="py-2.5 px-4">Room</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(approvalsSubTab === 'approved' ? approvedStudents : pendingStudents).map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2.5 px-4 font-mono">{s.studentId || 'N/A'}</td>
                        <td className="py-2.5 px-4">{s.department || 'N/A'}</td>
                        <td className="py-2.5 px-4">{s.email}</td>
                        <td className="py-2.5 px-4">
                          {approvalsSubTab === 'approved' ? (
                            <span className="font-semibold">{s.roomNumber || 'N/A'}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. B-224"
                              value={roomInputs[s._id] || s.roomNumber || ''}
                              onChange={(e) => setRoomInputs({ ...roomInputs, [s._id]: e.target.value })}
                              className="px-2 py-1 text-xs border rounded border-slate-300 w-24"
                            />
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          {approvalsSubTab !== 'approved' && (
                            <>
                              <button
                                onClick={() => handleApproveStudent(s)}
                                disabled={approvingId === s._id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectStudent(s)}
                                disabled={rejectingId === s._id}
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

        {/* Modal: Update Ticket */}
        {selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-md border border-slate-300 max-w-sm w-full p-6 text-xs text-slate-800">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Update Ticket: {selectedProblem.category}
              </h3>
              <p className="text-slate-500 mb-4">
                Room {selectedProblem.roomNumber} • Student: {selectedProblem.studentName}
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    placeholder="e.g. Rafiq (Electrician)"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Staff Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Repair details..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedProblem(null)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleProblemStatusChange('in-progress')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-semibold cursor-pointer"
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleProblemStatusChange('resolved')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
