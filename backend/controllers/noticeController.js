const Notice = require('../models/Notice');
const AuditLog = require('../models/AuditLog');

// @desc    Get all published notices (Public or Authenticated)
// @route   GET /api/notices
// @access  Public / Private
const getNotices = async (req, res) => {
  try {
    const { category, priority } = req.query;
    let filter = { isPublished: true };

    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const notices = await Notice.find(filter)
      .populate('author', 'name role')
      .sort({ priority: -1, createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notice (Admin or Staff)
// @route   POST /api/notices
// @access  Private/Staff
const createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, expiresAt } = req.body;

    const notice = await Notice.create({
      title: title.trim(),
      content,
      category: category || 'general',
      priority: priority || 'normal',
      targetAudience: targetAudience || 'all',
      expiresAt: expiresAt || null,
      author: req.user._id,
      isPublished: true,
    });

    await AuditLog.create({
      action: 'NOTICE_CREATED',
      module: 'notice',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetEntity: 'Notice',
      targetId: notice._id.toString(),
      details: { title },
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Staff
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const { title, content, category, priority, isPublished } = req.body;
    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (isPublished !== undefined) notice.isPublished = isPublished;

    await notice.save();
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await Notice.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
};
