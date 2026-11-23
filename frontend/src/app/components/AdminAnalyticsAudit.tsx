import React, { useState, useEffect } from 'react';
import { 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../api';

export function AdminAnalyticsAudit() {
  const [stats, setStats] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('hall_management_user')
    ? JSON.parse(localStorage.getItem('hall_management_user')!).token
    : '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, logsData] = await Promise.all([
        api.get('/reports/dashboard-stats', token),
        api.get('/reports/audit-logs', token),
      ]);
      setStats(statsData);
      setAuditLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4 font-sans text-xs text-slate-800 antialiased">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hall Analytics & Audit Logs</h2>
          <p className="text-slate-500">Occupancy statistics and administrative activity logs.</p>
        </div>
        <button
          onClick={fetchData}
          className="px-2.5 py-1 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <p className="p-6 text-center text-slate-500">Loading analytics...</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-3.5 rounded-md border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Occupancy</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.accommodation?.occupancyRate || 0}%</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stats.accommodation?.occupied} / {stats.accommodation?.totalSeats} beds</p>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Students</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{stats.students?.total || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stats.students?.residential} residential</p>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Revenue</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">৳ {stats.finance?.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stats.finance?.totalTransactions} payments</p>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Dues</span>
              <p className="text-2xl font-bold text-amber-700 mt-1 font-mono">৳ {stats.finance?.totalDue?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Unpaid invoices</p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="space-y-2 pt-2">
            <h3 className="font-bold text-slate-900 text-sm">System Audit Trail</h3>
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No activity recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Time</th>
                        <th className="py-2.5 px-4">Action</th>
                        <th className="py-2.5 px-4">Module</th>
                        <th className="py-2.5 px-4">User</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{log.action}</td>
                          <td className="py-2.5 px-4 capitalize">{log.module}</td>
                          <td className="py-2.5 px-4">{log.performedBy?.name || 'System'}</td>
                          <td className="py-2.5 px-4 capitalize text-[10px] text-slate-500">{log.performerRole}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
