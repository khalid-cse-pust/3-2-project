import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { api } from '../../api';

export function AdminNoticeManagement() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    targetAudience: 'all',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const token = localStorage.getItem('hall_management_user')
    ? JSON.parse(localStorage.getItem('hall_management_user')!).token
    : '';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await api.get('/notices');
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    try {
      await api.post('/notices', newNotice, token);
      setShowAddModal(false);
      setNewNotice({ title: '', content: '', category: 'general', priority: 'normal', targetAudience: 'all' });
      await fetchNotices();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create notice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this official notice?')) return;
    try {
      await api.delete(`/notices/${id}`, token);
      await fetchNotices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Institutional Bulletins</span>
          <h2 className="text-2xl font-bold text-[#16324F] mt-1">Hall Notices & Circulars</h2>
          <p className="text-xs text-slate-500">
            Publish official announcements, fee deadlines, allocation notices, and maintenance advisories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-[#087E8B] hover:bg-[#066570] text-white rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Publish Notice</span>
          </button>
          <button
            onClick={fetchNotices}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
          No notices currently published. Click "Publish Notice" above to create an announcement.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 hover:border-[#087E8B] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      n.priority === 'urgent'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {n.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#16324F] mb-2 leading-snug">
                  {n.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">
                  {n.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Target: <strong className="text-slate-600 capitalize">{n.targetAudience}</strong>
                </span>
                <button
                  onClick={() => handleDeleteNotice(n._id)}
                  className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#16324F] mb-4">Publish Institutional Notice</h3>
            {actionError && (
              <div className="mb-4 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-200">
                {actionError}
              </div>
            )}
            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notice Headline / Title</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. Mandatory Hall Clearance Before Semester Final"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  >
                    <option value="general">General</option>
                    <option value="seat_allocation">Seat Allocation</option>
                    <option value="dining_hall">Dining Hall</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="discipline">Discipline</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Audience</label>
                  <select
                    value={newNotice.targetAudience}
                    onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notice Body / Description</label>
                <textarea
                  rows={5}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Enter full announcement details..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Publishing...' : 'Publish Official Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
