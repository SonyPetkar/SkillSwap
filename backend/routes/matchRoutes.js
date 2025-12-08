// routes/matchRoutes.js
const express = require("express");
const router = express.Router();
// User model is not directly used in these routes but often needed in other controllers, keep for consistency
const User = require('../models/User');
// Ensure verifyToken is correctly imported from your middlewares folder
const {verifyToken, ensureAdmin} = require('../middlewares/auth');

// Import all functions from matchController that are used in this route file
const { getSkillMatches, proactiveMatch, sendSwapRequest } = require('../controllers/matchController');

// Route to get general skill matches (e.g., for recommendations or a search page)
router.get('/', verifyToken, getSkillMatches);
router.get('/proactive-match', verifyToken, proactiveMatch);
router.post('/request', verifyToken, sendSwapRequest); 

module.exports = router;
