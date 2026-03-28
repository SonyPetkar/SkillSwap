const mongoose = require('mongoose'); 
const Report = require('../models/Report');
const Session = require('../models/Session'); 
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/report-images'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage: storage });

const createReport = async (req, res) => {
  try {
    const { reason, description, reporter, targetUser, session } = req.body;

    console.log('Received Report Data:', req.body);

    if (!mongoose.Types.ObjectId.isValid(reporter)) {
      return res.status(400).json({ message: 'Invalid reporter ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(targetUser)) {
      return res.status(400).json({ message: 'Invalid target user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(session)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const existingSession = await Session.findById(session);
    if (!existingSession) {
      return res.status(400).json({ message: 'Session not found' });
    }

    const report = new Report({
      reporter,
      targetUser,
      session,
      reason,
      description,
    });

    if (req.file) {
      report.screenshot = `/uploads/report-images/${req.file.filename}`;
    }

    await report.save();

    const userToUpdate = await User.findById(targetUser);
    if (userToUpdate) {
      userToUpdate.reportCount += 1;

      const io = req.app.get('socketio');

      if (userToUpdate.reportCount >= 5) {
        userToUpdate.isBlocked = true;
        await userToUpdate.save();
        if (io) {
          io.of('/chat').to(targetUser).emit('account_terminated');
        }
        return res.status(201).json({ message: 'Report submitted. User has been suspended.', report });
      } else {
        await userToUpdate.save();
        if (io) {
          io.of('/chat').to(targetUser).emit('receive_warning');
        }
      }
    }

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Error submitting report', error });
  }
};

module.exports = { createReport, upload };