import { useState } from 'react';
import { User, Problem } from '../App';
import { LogOut, AlertCircle, CheckCircle, Clock, Home, Search } from 'lucide-react';

interface StaffDashboardProps {
  user: User;
  problems: Problem[];
  onLogout: () => void;
  onProblemUpdate: (id: string, status: Problem['status'], staffRemarks?: string) => void;
}

type ActiveView = 'overview' | 'problems';

export function StaffDashboard({
  user,
  problems,
  onLogout,
  onProblemUpdate
}: StaffDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Problem['status'] | 'all'>('all');

  const pendingProblems = problems.filter(p => p.status === 'pending');
  const assignedProblems = problems.filter(p => p.status === 'assigned' || p.status === 'in-progress');
  const resolvedProblems = problems.filter(p => p.status === 'resolved');

  const filteredProblems = problems.filter(problem => {
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

  const getCategoryIcon = (category: string) => {
    return <AlertCircle className="size-5" />;
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-teal-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Home className="size-8" />
            <div>
              <h2 className="text-white">Hall Management</h2>
              <p className="text-sm text-teal-200">Staff Portal</p>
            </div>
          </div>
          
          <div className="mb-6 p-3 bg-teal-800 rounded-lg">
            <p className="text-sm text-teal-200">Logged in as</p>
            <p className="truncate">{user.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'overview' ? 'bg-teal-700' : 'hover:bg-teal-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('problems')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'problems' ? 'bg-teal-700' : 'hover:bg-teal-800'
            }`}
          >
            All Problems
          </button>
        </nav>

        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-3 bg-teal-800 hover:bg-teal-700 rounded-lg transition-colors"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeView === 'overview' && (
          <div>
            <h1 className="mb-8">Staff Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="size-6 text-orange-600" />
                  <h3>Total</h3>
                </div>
                <p className="text-gray-600">Problems</p>
                <p className="text-3xl mt-2">{problems.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="size-6 text-yellow-600" />
                  <h3>New</h3>
                </div>
                <p className="text-gray-600">Submitted</p>
                <p className="text-3xl mt-2">{pendingProblems.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="size-6 text-blue-600" />
                  <h3>Active</h3>
                </div>
                <p className="text-gray-600">In Progress</p>
                <p className="text-3xl mt-2">{assignedProblems.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="size-6 text-green-600" />
                  <h3>Resolved</h3>
                </div>
                <p className="text-gray-600">Completed</p>
                <p className="text-3xl mt-2">{resolvedProblems.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="mb-4">New Problems</h2>
                {pendingProblems.length === 0 ? (
                  <p className="text-gray-500">No new problems pending.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingProblems.slice(0, 5).map((problem) => (
                      <div
                        key={problem.id}
                        className="border border-gray-200 p-4 rounded-lg hover:border-teal-300 transition-colors cursor-pointer"
                        onClick={() => setSelectedProblem(problem)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(problem.category)}
                            <h3>{problem.category}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(problem.status)}`}>
                            {problem.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Room: {problem.roomNumber} • {problem.studentName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {problem.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="mb-4">In Progress</h2>
                {assignedProblems.length === 0 ? (
                  <p className="text-gray-500">No problems currently in progress.</p>
                ) : (
                  <div className="space-y-3">
                    {assignedProblems.slice(0, 5).map((problem) => (
                      <div
                        key={problem.id}
                        className="border border-gray-200 p-4 rounded-lg hover:border-teal-300 transition-colors cursor-pointer"
                        onClick={() => setSelectedProblem(problem)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(problem.category)}
                            <h3>{problem.category}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(problem.status)}`}>
                            {problem.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Room: {problem.roomNumber} • {problem.studentName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {problem.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'problems' && (
          <div>
            <h1 className="mb-6">All Problems</h1>
            
            <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, room, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setFilterStatus('assigned')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterStatus === 'assigned'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Assigned
                </button>
                <button
                  onClick={() => setFilterStatus('in-progress')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterStatus === 'in-progress'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilterStatus('resolved')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    filterStatus === 'resolved'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredProblems.map((problem) => (
                <div key={problem.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(problem.category)}
                        <h3>{problem.category}</h3>
                        <span className={`px-3 py-1 rounded text-sm ${getStatusColor(problem.status)}`}>
                          {problem.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Room: {problem.roomNumber} • Student: {problem.studentName}
                      </p>
                      <p className="text-gray-700 mb-2">{problem.description}</p>
                      {problem.image && (
                        <div className="my-3">
                          <img
                            src={problem.image}
                            alt="Problem"
                            className="max-h-48 rounded-lg object-contain border border-gray-200"
                          />
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(problem.createdAt).toLocaleString()}
                      </p>
                      {problem.assignedTo && (
                        <p className="text-sm text-gray-600 mt-1">
                          Assigned to: {problem.assignedTo}
                        </p>
                      )}
                      {problem.staffRemarks && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600 mb-1">Staff Remarks:</p>
                          <p className="text-sm">{problem.staffRemarks}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedProblem(problem)}
                      className="ml-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm whitespace-nowrap"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredProblems.length === 0 && (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No problems found matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Problem Update Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="mb-2">Update Problem Status</h2>
                  <span className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedProblem.status)}`}>
                    Current: {selectedProblem.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProblem(null);
                    setRemarks('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Student Name</p>
                    <p>{selectedProblem.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Number</p>
                    <p>{selectedProblem.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p>{selectedProblem.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted At</p>
                    <p>{new Date(selectedProblem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="p-3 bg-gray-50 rounded">{selectedProblem.description}</p>
                </div>

                {selectedProblem.image && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Attached Image</p>
                    <img
                      src={selectedProblem.image}
                      alt="Problem"
                      className="max-h-64 rounded-lg object-contain border border-gray-200 w-full"
                    />
                  </div>
                )}

                {selectedProblem.staffRemarks && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Previous Remarks</p>
                    <p className="p-3 bg-gray-50 rounded text-sm">{selectedProblem.staffRemarks}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 text-gray-700">
                  Staff Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="Add any notes or updates..."
                />

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {selectedProblem.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('assigned')}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Assign to Me
                    </button>
                  )}
                  {(selectedProblem.status === 'pending' || selectedProblem.status === 'assigned') && (
                    <button
                      onClick={() => handleStatusUpdate('in-progress')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {selectedProblem.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 col-span-2"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}