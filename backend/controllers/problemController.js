const Problem = require('../models/Problem');

// @desc    Create new problem report
// @route   POST /api/problems
// @access  Private
const addProblem = async (req, res) => {
  try {
    const problem = new Problem({
      user: req.user._id,
      ...req.body,
    });

    const createdProblem = await problem.save();
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
      problems = await Problem.find({}).populate('user', 'name email');
    } else {
      problems = await Problem.find({ user: req.user._id });
    }
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update problem status/assignment
// @route   PUT /api/problems/:id
// @access  Private/Staff
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (problem) {
      problem.status = req.body.status || problem.status;
      problem.assignedTo = req.body.assignedTo || problem.assignedTo;
      problem.staffRemarks = req.body.staffRemarks || problem.staffRemarks;

      const updatedProblem = await problem.save();
      res.json(updatedProblem);
    } else {
      res.status(404).json({ message: 'Problem not found' });
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
