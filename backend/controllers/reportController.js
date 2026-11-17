const User = require('../models/User');
const Application = require('../models/Application');
const Problem = require('../models/Problem');
const Room = require('../models/Room');
const Seat = require('../models/Seat');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

// @desc    Get comprehensive stats for main Admin Dashboard
// @route   GET /api/reports/dashboard-stats
// @access  Private/Staff
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const approvedStudents = await User.countDocuments({ role: 'student', isApproved: true });
    const pendingStudents = await User.countDocuments({ role: 'student', isApproved: false });
    const residentialStudents = await User.countDocuments({ role: 'student', isResidential: true });

    const totalRooms = await Room.countDocuments();
    const totalSeats = await Seat.countDocuments();
    const occupiedSeats = await Seat.countDocuments({ status: 'occupied' });
    const reservedSeats = await Seat.countDocuments({ status: 'reserved' });
    const availableSeats = Math.max(0, totalSeats - (occupiedSeats + reservedSeats));

    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const allocatedApplications = await Application.countDocuments({ status: 'allocated' });

    const openProblems = await Problem.countDocuments({ status: { $in: ['pending', 'assigned', 'in-progress'] } });
    const resolvedProblems = await Problem.countDocuments({ status: 'resolved' });

    // Payment aggregations
    const payments = await Payment.find({ status: 'success' });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const unpaidInvoices = await Invoice.find({ status: 'unpaid' });
    const totalDue = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const recentAuditLogs = await AuditLog.find({})
      .populate('performedBy', 'name role email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      students: {
        total: totalStudents,
        approved: approvedStudents,
        pending: pendingStudents,
        residential: residentialStudents,
        nonResidential: totalStudents - residentialStudents,
      },
      accommodation: {
        rooms: totalRooms,
        totalSeats,
        occupied: occupiedSeats,
        reserved: reservedSeats,
        available: availableSeats,
        occupancyRate: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
      },
      applications: {
        pending: pendingApplications,
        approved: approvedApplications,
        allocated: allocatedApplications,
      },
      maintenance: {
        open: openProblems,
        resolved: resolvedProblems,
      },
      finance: {
        totalRevenue,
        totalDue,
        totalTransactions: payments.length,
      },
      recentActivity: recentAuditLogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/reports/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('performedBy', 'name role email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs,
};
