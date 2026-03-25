const express = require('express');
const { 
  getUserProfile, 
  getUserProfileById, 
  updateUserProfile, 
  changePassword, 
  uploadProfilePicture 
} = require('../controllers/userController');
const { verifyToken, ensureAdmin } = require('../middlewares/auth');
const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);

router.put("/profile", verifyToken, uploadProfilePicture, updateUserProfile);

router.get("/profile/:id", verifyToken, getUserProfileById);

router.put("/change-password", verifyToken, changePassword);

module.exports = router;