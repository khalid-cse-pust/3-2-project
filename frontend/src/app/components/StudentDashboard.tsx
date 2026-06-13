import { useState } from 'react';
import { User, Application, Problem } from '../App';
import { LogOut, FileText, AlertCircle, Plus, Home, UserCircle } from 'lucide-react';
import { ApplicationForm } from './ApplicationForm';
import { ProblemForm } from './ProblemForm';
import { StudentAccount } from './StudentAccount';

interface StudentDashboardProps {
  user: User;
  applications: Application[];
  problems: Problem[];
  onLogout: () => void;
  onApplicationSubmit: (application: Omit<Application, 'id' | 'createdAt' | 'status'>) => void;
  onProblemSubmit: (problem: Omit<Problem, 'id' | 'createdAt' | 'status'>) => void;
}

type ActiveView = 'overview' | 'apply' | 'applications' | 'submit-problem' | 'problems' | 'account';

export function StudentDashboard({
  user,
  applications,
  problems,
  onLogout,
  onApplicationSubmit,
  onProblemSubmit
}: StudentDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');

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
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Home className="size-8" />
            <div>
              <h2 className="text-white">Hall Management</h2>
              <p className="text-sm text-indigo-200">Student Portal</p>
            </div>
          </div>
          
          <div className="mb-6 p-3 bg-indigo-800 rounded-lg">
            <p className="text-sm text-indigo-200">Logged in as</p>
            <p className="truncate">{user.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'overview' ? 'bg-indigo-700' : 'hover:bg-indigo-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('apply')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'apply' ? 'bg-indigo-700' : 'hover:bg-indigo-800'
            }`}
          >
            Apply for Hall Seat
          </button>
          <button
            onClick={() => setActiveView('applications')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'applications' ? 'bg-indigo-700' : 'hover:bg-indigo-800'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => setActiveView('submit-problem')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'submit-problem' ? 'bg-indigo-700' : 'hover:bg-indigo-800'
            }`}
          >
            Report Problem
          </button>
          <button
            onClick={() => setActiveView('problems')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'problems' ? 'bg-indigo-700' : 'hover:bg-indigo-800'
            }`}
          >
            My Problems
          </button>
          <button
            onClick={() => setActiveView('account')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'account' ? 'bg-indigo-700' : 'hover:bg-indigo-800'
            }`}
          >
            Account
          </button>
        </nav>

        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-800 hover:bg-indigo-700 rounded-lg transition-colors"
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
            <h1 className="mb-8">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="size-6 text-indigo-600" />
                  <h3>Applications</h3>
                </div>
                <p className="text-gray-600">Total Submitted</p>
                <p className="text-3xl mt-2">{applications.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="size-6 text-orange-600" />
                  <h3>Problems</h3>
                </div>
                <p className="text-gray-600">Total Reported</p>
                <p className="text-3xl mt-2">{problems.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Plus className="size-6 text-green-600" />
                  <h3>Quick Actions</h3>
                </div>
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => setActiveView('apply')}
                    className="w-full text-left px-3 py-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors text-sm"
                  >
                    Apply for Seat
                  </button>
                  <button
                    onClick={() => setActiveView('submit-problem')}
                    className="w-full text-left px-3 py-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors text-sm"
                  >
                    Report Problem
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="mb-4">Recent Applications</h2>
                {applications.length === 0 ? (
                  <p className="text-gray-500">No applications submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <p>{app.program}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="mb-4">Recent Problems</h2>
                {problems.length === 0 ? (
                  <p className="text-gray-500">No problems reported yet.</p>
                ) : (
                  <div className="space-y-3">
                    {problems.slice(0, 3).map((problem) => (
                      <div key={problem.id} className="border-l-4 border-orange-500 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <p>{problem.category}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(problem.status)}`}>
                            {problem.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{problem.roomNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'apply' && (
          <div>
            <h1 className="mb-6">Apply for Hall Seat</h1>
            <ApplicationForm user={user} onSubmit={handleApplicationSubmit} />
          </div>
        )}

        {activeView === 'applications' && (
          <div>
            <h1 className="mb-6">My Applications</h1>
            {applications.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't submitted any applications yet.</p>
                <button
                  onClick={() => setActiveView('apply')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Apply Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="mb-1">{app.program} - {app.year}</h3>
                        <p className="text-sm text-gray-500">
                          Submitted on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p>{app.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p>{app.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Guardian Name</p>
                        <p>{app.guardianName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Document</p>
                        <p>{app.document}</p>
                      </div>
                    </div>

                    {app.remarks && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600 mb-1">Admin Remarks:</p>
                        <p className="text-sm">{app.remarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'submit-problem' && (
          <div>
            <h1 className="mb-6">Report a Problem</h1>
            <ProblemForm user={user} onSubmit={handleProblemSubmit} />
          </div>
        )}

        {activeView === 'problems' && (
          <div>
            <h1 className="mb-6">My Reported Problems</h1>
            {problems.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't reported any problems yet.</p>
                <button
                  onClick={() => setActiveView('submit-problem')}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Report Problem
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {problems.map((problem) => (
                  <div key={problem.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="mb-1">{problem.category}</h3>
                        <p className="text-sm text-gray-500">
                          Room: {problem.roomNumber} • Submitted on {new Date(problem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded ${getStatusColor(problem.status)}`}>
                        {problem.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{problem.description}</p>

                    {problem.image && (
                      <div className="mb-4">
                        <img
                          src={problem.image}
                          alt="Problem"
                          className="max-h-64 rounded-lg object-contain border border-gray-200"
                        />
                      </div>
                    )}

                    {problem.assignedTo && (
                      <p className="text-sm text-gray-600 mb-2">
                        Assigned to: {problem.assignedTo}
                      </p>
                    )}

                    {problem.staffRemarks && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600 mb-1">Staff Remarks:</p>
                        <p className="text-sm">{problem.staffRemarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'account' && (
          <div>
            <h1 className="mb-6">My Account</h1>
            <StudentAccount user={user} />
          </div>
        )}
      </div>
    </div>
  );
}