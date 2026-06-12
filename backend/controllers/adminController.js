const User = require('../models/User');
const Report = require('../models/Report');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    const usersWithReports = await Promise.all(users.map(async (user) => {
      const reports = await Report.find({ targetUser: user._id }).populate('reporter', 'name email');
      return { 
        ...user._doc, 
        reportCount: reports.length, 
        reports 
      };
    }));

    res.json({ 
      total: users.length, 
      users: usersWithReports 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, status, skillsToTeach, skillsToLearn } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { name, status, skillsToTeach, skillsToLearn }, 
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Report.deleteMany({ targetUser: req.params.id });
    res.json({ message: "User completely removed from platform" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.json({ message: `User status changed`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};