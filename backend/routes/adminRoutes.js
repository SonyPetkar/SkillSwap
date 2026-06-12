const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  deleteUser, 
  suspendUser, 
  updateUser 
} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.put('/users/:id/suspend', authMiddleware, adminMiddleware, suspendUser);

module.exports = router;