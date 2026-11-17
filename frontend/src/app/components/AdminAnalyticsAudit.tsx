import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  DoorOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  DollarSign, 
  FileText,
  ShieldAlert,
  ArrowUpRight
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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#087E8B] uppercase">Institutional Governance</span>
          <h2 className="text-2xl font-bold text-[#16324F] mt-1">Analytics, Occupancy & System Audit Logs</h2>
          <p className="text-xs text-slate-500">
            Authoritative operational statistics and security audit trails of all administrative actions.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Compiling database analytics...</div>
      ) : stats ? (
        <>
          {/* Main Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hall Occupancy Rate</span>
              <p className="text-3xl font-extrabold text-[#16324F] mt-2">
                {stats.accommodation?.occupancyRate || 0}%
              </p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#087E8B] h-2 rounded-full"
                  style={{ width: `${Math.min(100, stats.accommodation?.occupancyRate || 0)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {stats.accommodation?.occupied} occupied / {stats.accommodation?.totalSeats} total beds
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Students</span>
              <p className="text-3xl font-extrabold text-[#16324F] mt-2">
                {stats.students?.total || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                {stats.students?.residential} Residential • {stats.students?.nonResidential} Non-Residential
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Revenue</span>
              <p className="text-3xl font-extrabold text-[#16803C] mt-2 font-mono">
                ৳ {stats.finance?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                {stats.finance?.totalTransactions} successful transactions
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Dues</span>
              <p className="text-3xl font-extrabold text-amber-700 mt-2 font-mono">
                ৳ {stats.finance?.totalDue?.toLocaleString() || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                Across unpaid student fee invoices
              </p>
            </div>
          </div>

          {/* Audit Trail Log Table */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="size-5 text-[#16324F]" />
                <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider">
                  Administrative Action & Security Audit Log
                </h3>
              </div>
              <span className="text-xs text-slate-500">{auditLogs.length} recent activity logs</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No administrative activity recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Performed By</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#16324F]">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 capitalize">{log.module}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {log.performedBy?.name || 'System Auto'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {log.performerRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {log.targetEntity || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
