const Room = require('../models/Room');
const Seat = require('../models/Seat');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all rooms with summary of occupied seats
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const { block, floor, status } = req.query;
    let filter = {};
    if (block) filter.block = block;
    if (floor) filter.floor = Number(floor);
    if (status) filter.status = status;

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    
    // Also attach seats count for each room
    const seats = await Seat.find({});
    const roomsWithSeats = rooms.map((room) => {
      const roomSeats = seats.filter(
        (s) => s.room.toString() === room._id.toString() || s.roomNumber === room.roomNumber
      );
      const occupiedCount = roomSeats.filter((s) => s.status === 'occupied').length;
      return {
        ...room.toObject(),
        seats: roomSeats,
        occupiedSeatsCount: occupiedCount,
        availableSeatsCount: Math.max(0, room.capacity - occupiedCount),
      };
    });

    res.json(roomsWithSeats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room with seat details
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const seats = await Seat.find({
      $or: [{ room: room._id }, { roomNumber: room.roomNumber }],
    }).populate('allocatedStudent', 'name studentId email department phone');

    res.json({
      ...room.toObject(),
      seats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a room (Admin only)
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const { roomNumber, block, floor, capacity = 4, roomType = 'standard' } = req.body;

    const existing = await Room.findOne({ roomNumber: roomNumber.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim().toUpperCase(),
      block,
      floor,
      capacity: Number(capacity),
      roomType,
      status: 'available',
    });

    // Auto-create seats for this room: A, B, C, D...
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, Number(capacity));
    const seatDocs = labels.map((label) => ({
      seatNumber: `${room.roomNumber}-${label}`,
      room: room._id,
      roomNumber: room.roomNumber,
      bedLabel: label,
      status: 'available',
    }));

    await Seat.insertMany(seatDocs);

    await AuditLog.create({
      action: 'ROOM_CREATED',
      module: 'room',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Room',
      targetId: room._id.toString(),
      details: { roomNumber: room.roomNumber, capacity },
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room details (status, maintenance notes)
// @route   PUT /api/rooms/:id
// @access  Private/Staff
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const { status, maintenanceNotes } = req.body;
    if (status) room.status = status;
    if (maintenanceNotes !== undefined) room.maintenanceNotes = maintenanceNotes;

    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all seats
// @route   GET /api/rooms/seats/all
// @access  Private
const getAllSeats = async (req, res) => {
  try {
    const { status, roomNumber } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (roomNumber) filter.roomNumber = roomNumber.toUpperCase();

    const seats = await Seat.find(filter)
      .populate('allocatedStudent', 'name studentId email department phone')
      .sort({ seatNumber: 1 });

    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Directly assign a seat to a student (Admin/Staff)
// @route   POST /api/rooms/seats/:id/assign
// @access  Private/Staff
const assignSeat = async (req, res) => {
  try {
    const { studentId, studentUserId } = req.body;
    const seat = await Seat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.status === 'occupied') {
      return res.status(400).json({ message: 'Seat is already occupied' });
    }

    let student;
    if (studentUserId) {
      student = await User.findById(studentUserId);
    } else if (studentId) {
      student = await User.findOne({ studentId: studentId.trim() });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student user not found' });
    }

    // Check if student already has another seat
    const existingAllocation = await Seat.findOne({
      allocatedStudent: student._id,
      _id: { $ne: seat._id },
      status: 'occupied',
    });
    if (existingAllocation) {
      return res.status(400).json({
        message: `Student is already allocated to seat ${existingAllocation.seatNumber}`,
      });
    }

    // Assign seat
    seat.status = 'occupied';
    seat.allocatedStudent = student._id;
    seat.studentId = student.studentId;
    seat.allocatedAt = new Date();
    seat.allocatedBy = req.user._id;
    await seat.save();

    // Update Student user record
    student.isResidential = true;
    student.roomNumber = seat.roomNumber;
    student.seatNumber = seat.seatNumber;
    student.allocatedSeat = seat._id;
    await student.save();

    await AuditLog.create({
      action: 'SEAT_ASSIGNED',
      module: 'seat',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Seat',
      targetId: seat._id.toString(),
      details: { seatNumber: seat.seatNumber, studentId: student.studentId },
    });

    res.json({ success: true, seat, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vacate or Cancel a seat allocation
// @route   POST /api/rooms/seats/:id/vacate
// @access  Private/Staff
const vacateSeat = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    const previousStudentId = seat.allocatedStudent;

    if (previousStudentId) {
      await User.findByIdAndUpdate(previousStudentId, {
        isResidential: false,
        seatNumber: '',
        allocatedSeat: null,
      });
    }

    seat.status = 'available';
    seat.allocatedStudent = null;
    seat.studentId = null;
    seat.allocatedAt = null;
    await seat.save();

    await AuditLog.create({
      action: 'SEAT_VACATED',
      module: 'seat',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Seat',
      targetId: seat._id.toString(),
      details: { seatNumber: seat.seatNumber, vacatedStudent: previousStudentId },
    });

    res.json({ success: true, message: `Seat ${seat.seatNumber} has been vacated` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  getAllSeats,
  assignSeat,
  vacateSeat,
};
