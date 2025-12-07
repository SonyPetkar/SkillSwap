const express = require("express");
const router = express.Router();
const { 
    sendSessionRequest, 
    acceptSessionRequest, 
    getPendingSessions, 
    getAcceptedSessions, 
    getCompletedSessions, 
    getCanceledSessions, 
    scheduleSession, 
    markSessionAsCompletedOrCanceled, 
    getUserAverageRating 
} = require('../controllers/sessionController'); 
const {verifyToken} = require('../middlewares/auth'); // Assuming you use verifyToken for auth

// Send session request
router.post("/request", verifyToken, sendSessionRequest);

// Accept session request
router.post("/accept", verifyToken, acceptSessionRequest);

// Get pending session requests
router.get("/pending", verifyToken, getPendingSessions);

// Route to get accepted session requests for the logged-in user
router.get("/accepted", verifyToken, getAcceptedSessions);

// Get completed sessions for the logged-in user
router.get('/completed', verifyToken, getCompletedSessions);

// Get canceled sessions for the logged-in user
router.get('/canceled', verifyToken, getCanceledSessions);

// Schedule a new session (new meeting time)
router.post("/schedule", verifyToken, scheduleSession);

// Mark session as completed or canceled and submit feedback
router.post("/mark-session", verifyToken, markSessionAsCompletedOrCanceled);

// Route to get the average rating for a user
router.get('/ratings/:userId', verifyToken, getUserAverageRating);

module.exports = router;