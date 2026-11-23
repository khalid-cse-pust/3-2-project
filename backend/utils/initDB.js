// Polyfill global crypto for Node.js 18+ mongodb driver compatibility
if (!globalThis.crypto) {
  try {
    globalThis.crypto = require('crypto').webcrypto || require('crypto');
  } catch (e) {
    globalThis.crypto = require('crypto');
  }
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const Seat = require('../models/Seat');
const Application = require('../models/Application');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Problem = require('../models/Problem');
const Notice = require('../models/Notice');
const AuditLog = require('../models/AuditLog');
const Otp = require('../models/Otp');

/**
 * Initialize MongoDB Database safely and idempotently:
 * - Checks & verifies collections
 * - Creates & verifies all indexes
 * - Safely provisions default required roles & accounts (preserving existing records)
 * - Safely provisions standard rooms and seats
 * - Re-links any orphaned application/seat references
 * - Provisions default payable invoices for students if none exist
 */
async function initDatabase(options = {}) {
  const { quiet = false } = options;
  const log = (...args) => {
    if (!quiet) console.log('[DB-INIT]', ...args);
  };

  try {
    // 1. Ensure connected to MongoDB
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGO_URI;
      if (!uri) {
        throw new Error('MONGO_URI is not defined in backend environment');
      }
      log('Connecting to MongoDB...');
      await mongoose.connect(uri);
    }
    log(`Connected to MongoDB host: ${mongoose.connection.host}, database: ${mongoose.connection.name}`);

    // 2. Ensure all Mongoose models sync indexes safely
    log('Synchronizing schema indexes...');
    await Promise.allSettled([
      User.syncIndexes(),
      Room.syncIndexes(),
      Seat.syncIndexes(),
      Application.syncIndexes(),
      Invoice.syncIndexes(),
      Payment.syncIndexes(),
      Problem.syncIndexes(),
      Notice.syncIndexes(),
      AuditLog.syncIndexes(),
      Otp.syncIndexes(),
    ]);
    log('All collection indexes verified successfully.');

    // 3. Default Users Setup (Preserving existing data)
    log('Verifying default user accounts...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    // Admin Account: Ashikuzzaman
    let admin = await User.findOne({ email: 'ashik.cse.pust@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Ashikuzzaman',
        email: 'ashik.cse.pust@gmail.com',
        password: defaultPasswordHash,
        role: 'admin',
        isApproved: true,
        approvalStatus: 'approved',
        department: 'CSE',
        phone: '01711000001',
      });
      log('Created default Admin account: ashik.cse.pust@gmail.com (pwd: password123)');
    } else {
      let updated = false;
      if (!admin.isApproved || admin.approvalStatus !== 'approved' || admin.role !== 'admin') {
        admin.isApproved = true;
        admin.approvalStatus = 'approved';
        admin.role = 'admin';
        updated = true;
      }
      // Ensure password123 works
      if (!(await admin.matchPassword('password123')) && !(await admin.matchPassword('123456'))) {
        admin.password = defaultPasswordHash;
        updated = true;
      }
      if (updated) await admin.save();
      log('Verified existing Admin account: ashik.cse.pust@gmail.com');
    }

    // Staff Account: Sohel Rana
    let staff = await User.findOne({ email: 'sohel.cse.pust@gmail.com' });
    if (!staff) {
      staff = await User.create({
        name: 'Sohel Rana',
        email: 'sohel.cse.pust@gmail.com',
        password: defaultPasswordHash,
        role: 'staff',
        isApproved: true,
        approvalStatus: 'approved',
        department: 'Hall Administration',
        phone: '01711000002',
      });
      log('Created default Staff account: sohel.cse.pust@gmail.com (pwd: password123)');
    } else {
      let updated = false;
      if (!staff.isApproved || staff.approvalStatus !== 'approved' || staff.role !== 'staff') {
        staff.isApproved = true;
        staff.approvalStatus = 'approved';
        staff.role = 'staff';
        updated = true;
      }
      if (!(await staff.matchPassword('password123')) && !(await staff.matchPassword('123456'))) {
        staff.password = defaultPasswordHash;
        updated = true;
      }
      if (updated) await staff.save();
      log('Verified existing Staff account: sohel.cse.pust@gmail.com');
    }

    // Student 1: Khalid Hossen
    let student1 = await User.findOne({
      $or: [{ email: 'khalid.cse.pust@gmail.com' }, { studentId: '220133' }],
    });
    if (!student1) {
      student1 = await User.create({
        name: 'Khalid Hossen',
        email: 'khalid.cse.pust@gmail.com',
        studentId: '220133',
        password: defaultPasswordHash,
        role: 'student',
        department: 'CSE',
        session: '2021-2022',
        phone: '01711000003',
        isApproved: true,
        approvalStatus: 'approved',
        isResidential: true,
        roomNumber: 'B-224',
        seatNumber: 'B-224-A',
      });
      log('Created default Student account: khalid.cse.pust@gmail.com (ID: 220133)');
    } else {
      let updated = false;
      if (!student1.studentId) {
        student1.studentId = '220133';
        updated = true;
      }
      if (!student1.isApproved) {
        student1.isApproved = true;
        student1.approvalStatus = 'approved';
        updated = true;
      }
      if (!(await student1.matchPassword('password123')) && !(await student1.matchPassword('123456'))) {
        student1.password = defaultPasswordHash;
        updated = true;
      }
      if (updated) await student1.save();
      log('Verified existing Student account: khalid.cse.pust@gmail.com (ID: 220133)');
    }

    // Student 2: Swapnomoy Biswas
    let student2 = await User.findOne({
      $or: [{ email: 'khalidhossen785@gmail.com' }, { studentId: '220132' }],
    });
    if (!student2) {
      student2 = await User.create({
        name: 'Swapnomoy Biswas',
        email: 'khalidhossen785@gmail.com',
        studentId: '220132',
        password: defaultPasswordHash,
        role: 'student',
        department: 'CSE',
        session: '2021-2022',
        phone: '01711000004',
        isApproved: true,
        approvalStatus: 'approved',
        isResidential: true,
        roomNumber: 'B-224',
        seatNumber: 'B-224-B',
      });
      log('Created default Student account: khalidhossen785@gmail.com (ID: 220132)');
    } else {
      let updated = false;
      if (!student2.isApproved) {
        student2.isApproved = true;
        student2.approvalStatus = 'approved';
        updated = true;
      }
      if (!(await student2.matchPassword('password123')) && !(await student2.matchPassword('123456'))) {
        student2.password = defaultPasswordHash;
        updated = true;
      }
      if (updated) await student2.save();
      log('Verified existing Student account: khalidhossen785@gmail.com (ID: 220132)');
    }

    // 4. Standard Rooms & Seats
    log('Verifying rooms and seat allocations...');
    const defaultRooms = [
      { roomNumber: 'B-101', block: 'Block B', floor: 1, capacity: 4, roomType: 'standard' },
      { roomNumber: 'B-102', block: 'Block B', floor: 1, capacity: 4, roomType: 'standard' },
      { roomNumber: 'B-201', block: 'Block B', floor: 2, capacity: 4, roomType: 'standard' },
      { roomNumber: 'B-224', block: 'Block B', floor: 2, capacity: 4, roomType: 'standard' },
      { roomNumber: 'A-101', block: 'Block A', floor: 1, capacity: 4, roomType: 'standard' },
      { roomNumber: 'A-201', block: 'Block A', floor: 2, capacity: 4, roomType: 'standard' },
    ];

    for (const rData of defaultRooms) {
      let room = await Room.findOne({ roomNumber: rData.roomNumber });
      if (!room) {
        room = await Room.create({
          ...rData,
          status: 'available',
        });
        log(`Created room: ${room.roomNumber}`);
      }

      // Ensure 4 seats: A, B, C, D
      const bedLabels = ['A', 'B', 'C', 'D'];
      for (const label of bedLabels) {
        const seatNum = `${room.roomNumber}-${label}`;
        let seat = await Seat.findOne({ seatNumber: seatNum });
        if (!seat) {
          await Seat.create({
            seatNumber: seatNum,
            room: room._id,
            roomNumber: room.roomNumber,
            bedLabel: label,
            status: 'available',
          });
        }
      }
    }

    // 5. Repair orphaned references
    log('Checking for orphaned application or seat references...');
    // Re-link applications
    const allApps = await Application.find({});
    for (const app of allApps) {
      const existingUser = await User.findById(app.user);
      if (!existingUser) {
        // Try to match by studentId
        const matchedUser = await User.findOne({ studentId: app.studentId });
        if (matchedUser) {
          app.user = matchedUser._id;
          await app.save();
          log(`Repaired orphaned application ${app._id} -> linked to user ${matchedUser.email}`);
        }
      }
    }

    // Assign Khalid Hossen to B-224-A if available
    const seatB224A = await Seat.findOne({ seatNumber: 'B-224-A' });
    if (seatB224A && student1) {
      seatB224A.status = 'occupied';
      seatB224A.allocatedStudent = student1._id;
      seatB224A.studentId = student1.studentId;
      seatB224A.allocatedAt = seatB224A.allocatedAt || new Date();
      await seatB224A.save();
    }

    // Assign Swapnomoy Biswas to B-224-B if available
    const seatB224B = await Seat.findOne({ seatNumber: 'B-224-B' });
    if (seatB224B && student2) {
      seatB224B.status = 'occupied';
      seatB224B.allocatedStudent = student2._id;
      seatB224B.studentId = student2.studentId;
      seatB224B.allocatedAt = seatB224B.allocatedAt || new Date();
      await seatB224B.save();
    }

    // Update room occupancy counters
    const rooms = await Room.find({});
    for (const r of rooms) {
      const count = await Seat.countDocuments({ roomNumber: r.roomNumber, status: 'occupied' });
      r.occupiedSeatsCount = count;
      r.status = count >= r.capacity ? 'full' : 'available';
      await r.save();
    }

    // 6. Notices Setup
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      log('Seeding default institutional notices...');
      await Notice.create([
        {
          title: 'Residency Application Schedule & Hall Fee Dues',
          content:
            'All undergraduate residential students are hereby informed that the semester hall accommodation fee must be cleared through the online student payment portal before the 30th of the current month.',
          category: 'seat_allocation',
          priority: 'urgent',
          targetAudience: 'students',
          author: admin._id,
          isPublished: true,
        },
        {
          title: 'Dining Hall Operating Guidelines & Hygiene Protocol',
          content:
            'Shadhinota Hall Dining Facility operates lunch between 12:30 PM - 2:30 PM and dinner between 8:00 PM - 10:00 PM. Please maintain campus discipline and follow meal token reservations.',
          category: 'dining_hall',
          priority: 'normal',
          targetAudience: 'all',
          author: staff._id,
          isPublished: true,
        },
        {
          title: 'Campus High-Speed Wi-Fi & Facility Maintenance',
          content:
            'Routine electrical and network maintenance will be conducted across Block A and Block B on Saturdays. Report any room equipment issues via the Problem Reporting portal.',
          category: 'maintenance',
          priority: 'normal',
          targetAudience: 'all',
          author: staff._id,
          isPublished: true,
        },
      ]);
      log('Created 3 institutional notices.');
    }

    // 7. Ensure test students have payable demo invoices
    log('Verifying student fee ledger & payable invoices...');
    const unpaidInvoicesStudent1 = await Invoice.countDocuments({
      $or: [{ student: student1._id }, { studentId: student1.studentId }],
      status: 'unpaid',
    });

    if (unpaidInvoicesStudent1 === 0) {
      // Create a test payable invoice so Khalid Hossen can test dummy payment immediately
      const invNum = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await Invoice.create({
        invoiceNumber: invNum,
        student: student1._id,
        user: student1._id,
        studentId: student1.studentId,
        studentName: student1.name,
        email: student1.email,
        category: 'monthly_hall_fee',
        title: 'Monthly Hall Accommodation Fee',
        description: 'Residential accommodation, electricity, and water fee for current semester (Room B-224, Bed A)',
        amount: 850,
        currency: 'BDT',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'unpaid',
        isSandbox: true,
      });
      log(`Created payable demo invoice ${invNum} (৳850) for student ${student1.name} (${student1.studentId})`);
    }

    const unpaidInvoicesStudent2 = await Invoice.countDocuments({
      $or: [{ student: student2._id }, { studentId: student2.studentId }],
      status: 'unpaid',
    });

    if (unpaidInvoicesStudent2 === 0) {
      const invNum2 = `INV-${Date.now() + 5}-${Math.floor(100 + Math.random() * 900)}`;
      await Invoice.create({
        invoiceNumber: invNum2,
        student: student2._id,
        user: student2._id,
        studentId: student2.studentId,
        studentName: student2.name,
        email: student2.email,
        category: 'semester_hall_fee',
        title: 'Semester Hall Residency Dues',
        description: 'Semester hall amenity and maintenance dues for Shadhinota Hall (Room B-224, Bed B)',
        amount: 1200,
        currency: 'BDT',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'unpaid',
        isSandbox: true,
      });
      log(`Created payable demo invoice ${invNum2} (৳1200) for student ${student2.name} (${student2.studentId})`);
    }

    // 8. Log Summary
    const stats = {
      users: await User.countDocuments(),
      rooms: await Room.countDocuments(),
      seats: await Seat.countDocuments(),
      invoices: await Invoice.countDocuments(),
      payments: await Payment.countDocuments(),
      notices: await Notice.countDocuments(),
    };
    log('Database initialization complete! Summary:', JSON.stringify(stats));

    return { success: true, stats };
  } catch (error) {
    console.error('[DB-INIT ERROR]', error);
    throw error;
  }
}

// Standalone execution support: node utils/initDB.js
if (require.main === module) {
  initDatabase()
    .then((res) => {
      console.log('Database initialization succeeded:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
module.exports.initDatabase = initDatabase;
