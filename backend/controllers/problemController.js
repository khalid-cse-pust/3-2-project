const Problem = require('../models/Problem');
const AuditLog = require('../models/AuditLog');

// @desc    Create new problem/maintenance report
// @route   POST /api/problems
// @access  Private
const addProblem = async (req, res) => {
  try {
    const { roomNumber, category, priority, description, image } = req.body;

    const problem = new Problem({
      user: req.user._id,
      studentId: req.user.studentId || 'N/A',
      studentName: req.user.name,
      email: req.user.email,
      roomNumber: roomNumber || req.user.roomNumber || 'Common Area',
      category: category || 'Electrical',
      priority: priority || 'medium',
      description,
      image,
      status: 'pending',
    });

    const createdProblem = await problem.save();

    await AuditLog.create({
      action: 'PROBLEM_REPORTED',
      module: 'complaint',
      performedBy: req.user._id,
      performerRole: 'student',
      targetEntity: 'Problem',
      targetId: createdProblem._id.toString(),
      details: { category, roomNumber },
    });

    res.status(201).json(createdProblem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Private
const getProblems = async (req, res) => {
  try {
    let problems;
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.category) filter.category = req.query.category;
      problems = await Problem.find(filter)
        .populate('user', 'name email studentId department phone')
        .sort({ createdAt: -1 });
    } else {
      problems = await Problem.find({ user: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update problem status/assignment (Staff/Admin)
// @route   PUT /api/problems/:id
// @access  Private/Staff
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (problem) {
      const { status, assignedTo, staffRemarks } = req.body;
      if (status) problem.status = status;
      if (assignedTo !== undefined) problem.assignedTo = assignedTo;
      if (staffRemarks !== undefined) problem.staffRemarks = staffRemarks;

      if (status === 'resolved' || status === 'closed') {
        problem.resolvedAt = new Date();
      }

      const updatedProblem = await problem.save();

      await AuditLog.create({
        action: `PROBLEM_${status ? status.toUpperCase() : 'UPDATED'}`,
        module: 'complaint',
        performedBy: req.user._id,
        performerRole: req.user.role,
        targetEntity: 'Problem',
        targetId: problem._id.toString(),
        details: { status, assignedTo, staffRemarks },
      });

      res.json(updatedProblem);
    } else {
      res.status(404).json({ message: 'Problem ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProblem,
  getProblems,
  updateProblem,
};
