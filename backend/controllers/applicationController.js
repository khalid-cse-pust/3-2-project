const Application = require('../models/Application');
const Seat = require('../models/Seat');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const addApplication = async (req, res) => {
  try {
    // Check if user already has an active application
    const existing = await Application.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'approved', 'allocated'] },
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have an active seat application in progress',
      });
    }

    const user = await User.findById(req.user._id);

    const application = new Application({
      user: req.user._id,
      studentId: user.studentId || req.body.studentId,
      studentName: user.name || req.body.studentName,
      email: user.email,
      phone: req.body.phone || user.phone || '',
      program: req.body.program || user.department || 'CSE',
      year: req.body.year || '3rd Year',
      session: req.body.session || user.session || '2021-2022',
      cgpa: req.body.cgpa || '',
      homeDistrict: req.body.homeDistrict || '',
      guardianName: req.body.guardianName || 'Guardian',
      guardianPhone: req.body.guardianPhone || '',
      address: req.body.address || 'Address',
      document: req.body.document || '',
      status: 'pending',
    });

    const createdApplication = await application.save();

    await AuditLog.create({
      action: 'APPLICATION_SUBMITTED',
      module: 'application',
      performedBy: req.user._id,
      performerRole: 'student',
      targetEntity: 'Application',
      targetId: createdApplication._id.toString(),
      details: { studentId: application.studentId },
    });

    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    let applications;
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      applications = await Application.find(filter)
        .populate('user', 'name email studentId department phone isResidential roomNumber')
        .populate('feeInvoice')
        .sort({ createdAt: -1 });
    } else {
      const orClauses = [{ user: req.user._id }];
      if (req.user.studentId) {
        orClauses.push({ studentId: req.user.studentId });
      }
      applications = await Application.find({ $or: orClauses })
        .populate('feeInvoice')
        .sort({ createdAt: -1 });
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application review status & assign seat (Admin/Staff)
// @route   PUT /api/applications/:id
// @access  Private/Staff
const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { status, remarks, assignedRoom, assignedSeat, feeAmount = 850 } = req.body;

    if (status) application.status = status;
    if (remarks !== undefined) application.remarks = remarks;
    if (assignedRoom) application.assignedRoom = assignedRoom;
    if (assignedSeat) application.assignedSeat = assignedSeat;

    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    // If status is approved and a seat is assigned -> reserve seat and generate payable invoice
    if (status === 'approved' && assignedSeat) {
      // Find seat and reserve
      const seat = await Seat.findOne({
        seatNumber: new RegExp('^' + assignedSeat.trim() + '$', 'i'),
      });
      if (seat) {
        seat.status = 'reserved';
        seat.allocatedStudent = application.user;
        seat.studentId = application.studentId;
        seat.reservationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days to pay
        await seat.save();
      }

      // Check if invoice already exists for this application to prevent duplicates
      let invoice = null;
      if (application.feeInvoice) {
        invoice = await Invoice.findById(application.feeInvoice);
      }

      if (!invoice) {
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        invoice = await Invoice.create({
          invoiceNumber,
          student: application.user,
          user: application.user,
          studentId: application.studentId,
          studentName: application.studentName,
          email: application.email,
          category: 'seat_allocation_fee',
          title: `Seat Allocation & Admission Fee (${assignedSeat})`,
          description: `Hall seat reservation confirmation fee for Room ${assignedRoom || 'Assigned'}, Bed ${assignedSeat}`,
          amount: Number(feeAmount),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'unpaid',
          relatedApplication: application._id,
          relatedSeat: seat ? seat._id : undefined,
          isSandbox: true,
        });

        application.feeInvoice = invoice._id;
        application.paymentStatus = 'unpaid';
      } else {
        // If invoice already existed and unpaid, update details
        if (invoice.status === 'unpaid') {
          invoice.title = `Seat Allocation & Admission Fee (${assignedSeat})`;
          invoice.description = `Hall seat reservation confirmation fee for Room ${assignedRoom || 'Assigned'}, Bed ${assignedSeat}`;
          invoice.amount = Number(feeAmount);
          if (seat) invoice.relatedSeat = seat._id;
          await invoice.save();
        }
      }
    }

    // If manually allocated by admin -> finalize seat and user status
    if (status === 'allocated' && application.assignedSeat) {
      application.paymentStatus = 'paid';
      const seat = await Seat.findOneAndUpdate(
        { seatNumber: new RegExp('^' + application.assignedSeat.trim() + '$', 'i') },
        {
          status: 'occupied',
          allocatedStudent: application.user,
          studentId: application.studentId,
          allocatedAt: new Date(),
        },
        { new: true }
      );

      if (seat && application.assignedRoom) {
        const totalOccupied = await Seat.countDocuments({
          roomNumber: application.assignedRoom,
          status: 'occupied',
        });
        await Room.findOneAndUpdate(
          { roomNumber: application.assignedRoom },
          { occupiedSeatsCount: totalOccupied }
        );
      }

      await User.findByIdAndUpdate(application.user, {
        isResidential: true,
        roomNumber: application.assignedRoom,
        seatNumber: application.assignedSeat,
        allocatedSeat: seat ? seat._id : undefined,
        isApproved: true,
        approvalStatus: 'approved',
      });
    }

    // If application rejected or cancelled -> release any reserved seat
    if ((status === 'rejected' || status === 'cancelled') && application.assignedSeat) {
      await Seat.findOneAndUpdate(
        { seatNumber: new RegExp('^' + application.assignedSeat.trim() + '$', 'i') },
        { status: 'available', allocatedStudent: null, studentId: null, reservationExpiry: null }
      );
    }

    const updatedApplication = await application.save();

    await AuditLog.create({
      action: `APPLICATION_${status ? status.toUpperCase() : 'UPDATED'}`,
      module: 'application',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Application',
      targetId: application._id.toString(),
      details: { status, assignedSeat, remarks },
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addApplication,
  getApplications,
  updateApplicationStatus,
};
