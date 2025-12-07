const Session = require('../models/Session');
const User = require('../models/User');  // Import User model
const mongoose = require('mongoose');
const { 
    sendNewMeetingScheduledNotification, 
    sendNotificationForFeedbackRequest, 
    sendNotificationForSessionCancellation 
} = require('./notificationController'); 

// Pass io to the controller (this is the /sessions namespace, not for chat)
let sessionSocket;  

const setSocketIO = (socketIO) => {
  sessionSocket = socketIO;  // Set io from server.js
};

// Create a new session request
const sendSessionRequest = async (req, res) => {
  const { userId2, sessionDate, sessionTime, skill } = req.body;

  if (!userId2 || !sessionDate || !sessionTime || !skill) {
    return res.status(400).json({ msg: 'Please provide all required fields (userId2, sessionDate, sessionTime)' });
  }

  try {
    const userId1 = req.user.id;

    const newSession = new Session({
      userId1,
      userId2,
      sessionDate,
      sessionTime,
      skill,  
      status: 'pending',
    });

    await newSession.save();

    res.json({ msg: 'Session request sent successfully', session: newSession });
  } catch (err) {
    console.error('Error creating session:', err.message);
    res.status(500).send('Server error');
  }
};

// Accept session request
const acceptSessionRequest = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    if (session.userId2.toString() !== req.user.id) {
      return res.status(400).json({ msg: 'You are not authorized to accept this session' });
    }

    session.status = 'accepted'; 
    await session.save();

    res.json({ msg: 'Session request accepted', session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get pending session requests for the logged-in user
const getPendingSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      userId2: userId,
      status: 'pending',
    }).populate('userId1'); // Populate requestor details

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all sessions (accepted, completed, canceled) for the connections list
const getAcceptedSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId }, // Where user is the requestor
        { userId2: userId }, // Where user is the acceptor
      ],
      // Filter out pending requests from the main connections list
      status: { $ne: 'pending' } 
    })
      .populate('userId1', 'name email profilePicture')  
      .populate('userId2', 'name email profilePicture'); 

    // console.log('Populated sessions:', sessions);  // Keep this debug log if needed

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get completed sessions for the logged-in user
const getCompletedSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId, status: 'completed' },
        { userId2: userId, status: 'completed' },
      ],
    }).populate('userId1').populate('userId2'); 

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get canceled sessions for the logged-in user
const getCanceledSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({
      $or: [
        { userId1: userId, status: 'canceled' },
        { userId2: userId, status: 'canceled' },
      ],
    }).populate('userId1').populate('userId2'); 

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Schedule a new session
const scheduleSession = async (req, res) => {
  const { sessionId, newMeetingDate, newMeetingTime } = req.body;
  
  console.log('Received sessionId:', sessionId); 
  
  if (!sessionId || !newMeetingDate || !newMeetingTime) {
    return res.status(400).json({ msg: 'SessionId, newMeetingDate, and newMeetingTime are required' });
  }

  try {
    // Use findById directly, MongoDB will handle the conversion
    const session = await Session.findById(sessionId); 
    if (!session) {
      console.log('Session not found in database!');
      return res.status(404).json({ msg: 'Session not found' });
    }

    console.log('Found session:', session); 

    session.newMeetingDate = new Date(newMeetingDate); 
    session.newMeetingTime = newMeetingTime; 
    await session.save();

    console.log('Updated session after save:', session);

    const skill = session.skill;

    const message = `You have a new meeting scheduled for ${newMeetingDate} at ${newMeetingTime} regarding the skill: ${skill}.`;
    sendNewMeetingScheduledNotification(session, message); 

    res.json({ msg: 'Session scheduled successfully', session });
  } catch (err) {
    console.error('Error scheduling session:', err.message);
    res.status(500).send('Server error');
  }
};

// Mark session as completed or canceled
const markSessionAsCompletedOrCanceled = async (req, res) => {
  const { sessionId, status, rating, feedback } = req.body;
  const userId = req.user.id;

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    if (![session.userId1.toString(), session.userId2.toString()].includes(userId)) {
      return res.status(403).json({ msg: 'You are not authorized to mark this session' });
    }

    // Build the update object
    const update = {
      status,
    };

    if (status === 'completed') {
      if (session.userId1.toString() === userId) {
        update.ratingByUser1 = rating;
        update.feedbackByUser1 = feedback;
        update.feedbackGivenByUser1 = true;
      } else {
        update.ratingByUser2 = rating;
        update.feedbackByUser2 = feedback;
        update.feedbackGivenByUser2 = true;
      }

   
      if (session.feedbackGivenByUser1 && session.feedbackGivenByUser2) {
        update.sessionClosed = true; // Apply closure to update
      }

      // Perform update and fetch the new document
      await Session.findByIdAndUpdate(sessionId, update, { new: true });

      const otherUserId = session.userId1.toString() === userId ? session.userId2 : session.userId1;
      await sendNotificationForFeedbackRequest(otherUserId);

      return res.json({ msg: 'Session updated successfully' });
    } else {
      update.sessionClosed = true;
      await Session.findByIdAndUpdate(sessionId, update, { new: true });

      await sendNotificationForSessionCancellation(session.userId1);
      await sendNotificationForSessionCancellation(session.userId2);

      return res.json({ msg: 'Session canceled successfully' });
    }
  } catch (error) {
    console.error('Error marking session as completed or canceled:', error);
    return res.status(500).send('Server error');
  }
};

// Calculate the average rating for a given user
const getUserAverageRating = async (req, res) => {
  const { userId } = req.params; 

  try {
    // Fetch all sessions where this user is either userId1 or userId2
    const sessions = await Session.find({
      $or: [
        { userId1: userId },
        { userId2: userId }
      ]
    });

    let totalRating = 0;
    let count = 0;

    // Loop through all sessions and sum up the ratings
    sessions.forEach(session => {
      // If the user is userId1, we look at the ratingByUser2
      if (session.userId1.toString() === userId && session.ratingByUser2 !== undefined && session.ratingByUser2 !== null) {
        totalRating += session.ratingByUser2;
        count++;
      } else if (session.userId2.toString() === userId && session.ratingByUser1 !== undefined && session.ratingByUser1 !== null) {
        totalRating += session.ratingByUser1;
        count++;
      }
    });

    // Calculate the average rating
    const averageRating = count > 0 ? (totalRating / count).toFixed(2) : 'N/A';

    res.json({ averageRating });
  } catch (err) {
    console.error('Error fetching user ratings:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { 
    setSocketIO, 
    sendSessionRequest, 
    acceptSessionRequest, 
    getPendingSessions, 
    getAcceptedSessions, 
    getCompletedSessions, 
    getCanceledSessions, 
    scheduleSession, 
    markSessionAsCompletedOrCanceled, 
    getUserAverageRating,
    
};