// skill-swap/backend/routes/matchmaking.js

const express = require('express');
const router = express.Router();

const matchmakingController = require('../controllers/matchmakingController');
// Import the middleware object
const authModule = require('../middlewares/auth'); 

// 🛑 FIX: Access the specific function (verifyToken) from the imported module
const verifyAuth = authModule.verifyToken; 

// Use the extracted function as middleware
router.get('/proactive-match', verifyAuth, matchmakingController.proactiveMatch);

module.exports = router;