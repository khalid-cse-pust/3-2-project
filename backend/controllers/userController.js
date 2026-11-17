const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const {
  sendOtpEmail,
  sendStudentApprovalEmail,
  sendStaffApprovalEmail,
} = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Send 6-digit OTP to user's email
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB with 10-minute validity
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.findOneAndUpdate(
      { email: cleanEmail },
      { otp, expiresAt },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // Send email
    await sendOtpEmail(cleanEmail, otp);

    // Check if user already exists in DB
    const existingUser = await User.findOne({ email: cleanEmail });

    res.json({
      success: true,
      message: `6-digit verification code sent to ${cleanEmail}`,
      exists: !!existingUser,
      isApproved: existingUser ? existingUser.isApproved : false,
      role: existingUser ? existingUser.role : null,
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

// @desc    Verify 6-digit OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    if (new Date() > record.expiresAt) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // OTP is valid - consume it
    await Otp.deleteOne({ _id: record._id });

    // Check if user exists
    const user = await User.findOne({ email: cleanEmail });

    if (user) {
      // If already registered
      if (!user.isApproved && user.role !== 'admin') {
        return res.json({
          success: true,
          verified: true,
          exists: true,
          isApproved: false,
          role: user.role,
          message:
            user.role === 'student'
              ? 'Your account is pending approval from Staff or Admin.'
              : 'Your account is pending approval from Admin.',
        });
      }

      // Approved user -> log in immediately to home page
      return res.json({
        success: true,
        verified: true,
        exists: true,
        isApproved: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
          roomNumber: user.roomNumber,
          isResidential: user.isResidential,
          phone: user.phone,
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus,
        },
      });
    }

    // Not registered yet -> create password & complete details
    return res.json({
      success: true,
      verified: true,
      exists: false,
      message: 'OTP verified successfully. Please create your password and complete registration.',
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ message: error.message || 'OTP verification failed' });
  }
};

// @desc    Auth user with password & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      // Check approval for students and staff
      if (!user.isApproved && user.role !== 'admin') {
        const approvalNotice =
          user.role === 'student'
            ? 'Your account is pending approval from Staff or Admin. You can login once approved.'
            : 'Your account is pending approval from Admin. You can login once approved.';
        return res.status(403).json({ message: approvalNotice, isPendingApproval: true });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        roomNumber: user.roomNumber,
        isResidential: user.isResidential,
        phone: user.phone,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      studentId,
      department,
      roomNumber,
      phone,
      isResidential,
    } = req.body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'student' && studentId) {
      const studentIdExists = await User.findOne({ studentId: studentId.trim() });
      if (studentIdExists) {
        return res.status(400).json({ message: 'Student ID already in use' });
      }
    }

    // Role Sanitization & Security Rule:
    // Direct public registration cannot claim 'admin' role.
    // If 'admin' is supplied in public signup without an existing admin session, reject or force 'student'
    let assignedRole = role;
    if (assignedRole === 'admin') {
      // Only permit admin role creation if authenticated requester is already an admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Administrator accounts cannot be created via public registration' });
      }
    } else if (assignedRole !== 'staff' && assignedRole !== 'student') {
      assignedRole = 'student';
    }

    // Approval requirement rules:
    // Student requires Staff/Admin approval -> isApproved: false
    // Staff requires Admin approval -> isApproved: false
    // Admin (if created by verified admin) -> isApproved: true
    const isApproved = assignedRole === 'admin';
    const approvalStatus = isApproved ? 'approved' : 'pending';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      studentId: assignedRole === 'student' ? (studentId ? studentId.trim() : undefined) : undefined,
      department: department ? department.trim() : undefined,
      roomNumber: roomNumber ? roomNumber.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      isResidential: isResidential ?? false,
      isApproved,
      approvalStatus,
    });

    if (user) {
      const pendingMessage =
        role === 'student'
          ? 'Registration submitted successfully. Approval needed from Staff or Admin.'
          : role === 'staff'
          ? 'Registration submitted successfully. Approval needed from Admin.'
          : 'Registration successful.';

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        roomNumber: user.roomNumber,
        phone: user.phone,
        isResidential: user.isResidential,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        token: isApproved ? generateToken(user._id) : undefined,
        message: pendingMessage,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending users for approval
// @route   GET /api/users/pending
// @access  Private (Staff or Admin)
const getPendingUsers = async (req, res) => {
  try {
    let query = { approvalStatus: 'pending' };

    // Staff can only view pending students
    // Admin can view both pending students and pending staff
    if (req.user.role === 'staff') {
      query.role = 'student';
    } else if (req.user.role === 'admin') {
      query.role = { $in: ['student', 'staff'] };
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const pendingUsers = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get approved users list
// @route   GET /api/users/approved-list
// @access  Private (Staff or Admin)
const getApprovedUsers = async (req, res) => {
  try {
    let query = { approvalStatus: 'approved' };

    if (req.user.role === 'staff') {
      query.role = 'student';
    } else if (req.user.role === 'admin') {
      query.role = { $in: ['student', 'staff'] };
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const approvedUsers = await User.find(query)
      .populate('approvedBy', 'name role email')
      .select('-password')
      .sort({ updatedAt: -1 });

    res.json(approvedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve user (Student by Staff/Admin, Staff by Admin only)
// @route   PUT /api/users/:id/approve
// @access  Private (Staff or Admin)
const approveUser = async (req, res) => {
  try {
    const userToApprove = await User.findById(req.params.id);

    if (!userToApprove) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Role check: If staff is being approved, only Admin can approve
    if (userToApprove.role === 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Staff approval requires Admin access' });
    }

    if (userToApprove.role === 'student') {
      // Room number can be provided during approval or fall back to previous or default
      const roomNumber = req.body.roomNumber?.trim() || userToApprove.roomNumber || 'Room Assigned';

      userToApprove.isApproved = true;
      userToApprove.approvalStatus = 'approved';
      userToApprove.roomNumber = roomNumber;
      userToApprove.isResidential = true;
      userToApprove.approvedBy = req.user._id;
      userToApprove.approvedAt = new Date();
      await userToApprove.save();

      // Send confirmation email to student
      try {
        await sendStudentApprovalEmail(userToApprove.email, roomNumber);
      } catch (mailErr) {
        console.error('Failed to send student approval email:', mailErr);
      }

      return res.json({
        success: true,
        message: `Student approved and confirmation email sent with room ${roomNumber}`,
        user: userToApprove,
      });
    }

    if (userToApprove.role === 'staff') {
      userToApprove.isApproved = true;
      userToApprove.approvalStatus = 'approved';
      userToApprove.approvedBy = req.user._id;
      userToApprove.approvedAt = new Date();
      await userToApprove.save();

      // Send confirmation email to staff
      try {
        await sendStaffApprovalEmail(userToApprove.email, userToApprove.name);
      } catch (mailErr) {
        console.error('Failed to send staff approval email:', mailErr);
      }

      return res.json({
        success: true,
        message: 'Staff approved successfully by Admin and notification email sent',
        user: userToApprove,
      });
    }

    res.status(400).json({ message: 'Invalid user role for approval' });
  } catch (error) {
    console.error('Error in approveUser:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject user registration
// @route   PUT /api/users/:id/reject
// @access  Private (Staff or Admin)
const rejectUser = async (req, res) => {
  try {
    const userToReject = await User.findById(req.params.id);

    if (!userToReject) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToReject.role === 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Staff rejection requires Admin access' });
    }

    userToReject.isApproved = false;
    userToReject.approvalStatus = 'rejected';
    userToReject.rejectionReason = req.body.reason || 'Application not accepted';
    await userToReject.save();

    res.json({
      success: true,
      message: 'User registration rejected',
      user: userToReject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/users/search/:studentId
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({ studentId: req.params.studentId }).select('-password');

    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  authUser,
  registerUser,
  getPendingUsers,
  getApprovedUsers,
  approveUser,
  rejectUser,
  getUserProfile,
  getStudentById,
};
