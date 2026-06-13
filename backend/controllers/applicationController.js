const Application = require('../models/Application');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const addApplication = async (req, res) => {
  try {
    const application = new Application({
      user: req.user._id,
      ...req.body,
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
  try {
    let applications;
    if (req.user.role === 'admin') {
      applications = await Application.find({}).populate('user', 'name email');
    } else {
      applications = await Application.find({ user: req.user._id });
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (application) {
      application.status = req.body.status || application.status;
      application.remarks = req.body.remarks || application.remarks;

      const updatedApplication = await application.save();
      res.json(updatedApplication);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addApplication,
  getApplications,
  updateApplicationStatus,
};
