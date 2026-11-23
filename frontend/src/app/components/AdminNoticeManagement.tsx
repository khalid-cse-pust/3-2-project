import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  RefreshCw 
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
      setActionError(err.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`, token);
      await fetchNotices();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-800 antialiased">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hall Notices</h2>
          <p className="text-slate-500">Publish and manage official notices for resident students.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded bg-[#087E8B] hover:bg-[#066570] text-white font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Publish Notice</span>
          </button>
          <button
            onClick={fetchNotices}
            className="px-2.5 py-1 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="p-6 text-center text-slate-500">Loading notices...</p>
      ) : notices.length === 0 ? (
        <p className="p-6 text-center text-slate-500 bg-white rounded border border-slate-200">No notices published.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((n) => (
            <div key={n._id} className="bg-white rounded-md border border-slate-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 capitalize">{n.category.replace('_', ' ')}</span>
                  <span>{new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{n.title}</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{n.content}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
                <span className="text-slate-500 capitalize">Audience: {n.targetAudience}</span>
                <button
                  onClick={() => handleDeleteNotice(n._id)}
                  className="text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-md w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-3">Publish Notice</h3>
            {actionError && <div className="p-2 mb-3 bg-rose-50 text-rose-700 rounded border border-rose-200">{actionError}</div>}
            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Notice headline..."
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="general">General</option>
                    <option value="seat_allocation">Seat Allocation</option>
                    <option value="dining_hall">Dining</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Audience</label>
                  <select
                    value={newNotice.targetAudience}
                    onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Body text..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-[#087E8B] hover:bg-[#066570] text-white rounded font-semibold cursor-pointer"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
