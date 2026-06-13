import { useState } from 'react';
import { User, Application } from '../App';
import { LogOut, FileText, CheckCircle, XCircle, Home } from 'lucide-react';
import { StudentSearchBar } from './StudentSearchBar';

interface AdminDashboardProps {
  user: User;
  applications: Application[];
  onLogout: () => void;
  onApplicationReview: (id: string, status: 'approved' | 'rejected', remarks: string) => void;
}

type ActiveView = 'overview' | 'applications';

export function AdminDashboard({
  user,
  applications,
  onLogout,
  onApplicationReview
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  const filteredApplications = applications.filter(app =>
    app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReview = (status: 'approved' | 'rejected') => {
    if (selectedApplication && remarks.trim()) {
      onApplicationReview(selectedApplication.id, status, remarks);
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-purple-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Home className="size-8" />
            <div>
              <h2 className="text-white">Hall Management</h2>
              <p className="text-sm text-purple-200">Admin Portal</p>
            </div>
          </div>
          
          <div className="mb-6 p-3 bg-purple-800 rounded-lg">
            <p className="text-sm text-purple-200">Logged in as</p>
            <p className="truncate">{user.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'overview' ? 'bg-purple-700' : 'hover:bg-purple-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('applications')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'applications' ? 'bg-purple-700' : 'hover:bg-purple-800'
            }`}
          >
            All Applications
          </button>
        </nav>

        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-3 bg-purple-800 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Search Student Bar - Always Visible */}
        <StudentSearchBar token={user.token} />
        
        {activeView === 'overview' && (
          <div>
            <h1 className="mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="size-6 text-blue-600" />
                  <h3>Total</h3>
                </div>
                <p className="text-gray-600">Applications</p>
                <p className="text-3xl mt-2">{applications.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="size-6 text-yellow-600" />
                  <h3>Pending</h3>
                </div>
                <p className="text-gray-600">Review Needed</p>
                <p className="text-3xl mt-2">{pendingApplications.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="size-6 text-green-600" />
                  <h3>Approved</h3>
                </div>
                <p className="text-gray-600">Applications</p>
                <p className="text-3xl mt-2">{approvedApplications.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="size-6 text-red-600" />
                  <h3>Rejected</h3>
                </div>
                <p className="text-gray-600">Applications</p>
                <p className="text-3xl mt-2">{rejectedApplications.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="mb-4">Pending Applications</h2>
              {pendingApplications.length === 0 ? (
                <p className="text-gray-500">No pending applications to review.</p>
              ) : (
                <div className="space-y-3">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="border border-gray-200 p-4 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
                      onClick={() => setSelectedApplication(app)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="mb-1">{app.studentName}</h3>
                          <p className="text-sm text-gray-600">
                            {app.program} - {app.year}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'applications' && (
          <div>
            <h1 className="mb-6">All Applications</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-600">Student Name</th>
                      <th className="px-6 py-3 text-left text-gray-600">Program</th>
                      <th className="px-6 py-3 text-left text-gray-600">Year</th>
                      <th className="px-6 py-3 text-left text-gray-600">Submitted</th>
                      <th className="px-6 py-3 text-left text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{app.studentName}</td>
                        <td className="px-6 py-4">{app.program}</td>
                        <td className="px-6 py-4">{app.year}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            View Details
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="mb-2">Application Review</h2>
                  <span className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedApplication(null);
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
                    <p>{selectedApplication.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Student ID</p>
                    <p>{selectedApplication.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p>{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p>{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Program</p>
                    <p>{selectedApplication.program}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Year</p>
                    <p>{selectedApplication.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Guardian Name</p>
                    <p>{selectedApplication.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Guardian Phone</p>
                    <p>{selectedApplication.guardianPhone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p>{selectedApplication.address}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Document Submitted</p>
                  <p className="text-purple-600">{selectedApplication.document}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted At</p>
                  <p>{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                </div>

                {selectedApplication.remarks && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Previous Remarks</p>
                    <p className="text-sm">{selectedApplication.remarks}</p>
                  </div>
                )}
              </div>

              {selectedApplication.status === 'pending' && (
                <div>
                  <label className="block mb-2 text-gray-700">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder="Enter your review comments..."
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleReview('approved')}
                      disabled={!remarks.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="size-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview('rejected')}
                      disabled={!remarks.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <XCircle className="size-5" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}