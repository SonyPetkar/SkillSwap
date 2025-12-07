const express = require("express");
const router = express.Router();
const multer = require("multer");

const { verifyToken: auth } = require("../middlewares/auth"); 

const {
  getMessageHistory,
  uploadMedia,
  upload,
} = require("../controllers/chatController");

/**
 * Unified API Response Utility (Keep this, but move to a utility file later)
 */
const apiResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};

// ----------------------------------------------------
// 🛠️ FIX 1: Directly pass the controller function to the router.get method.
// ----------------------------------------------------

/**
 * GET /chat/:sessionId
 * Fetch Chat Message History
 */
router.get("/:sessionId", auth, getMessageHistory); // ⬅️ FIX: Pass function directly

// ----------------------------------------------------
// 🛠️ FIX 2: Correct the POST route definition.
// ----------------------------------------------------

/**
 * POST /chat/upload-media
 * Upload media before emitting socket message
 */
router.post(
  "/upload-media",
  auth,
  // Use the multer middleware exported from chatController
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return apiResponse(res, 400, false, `Upload failed: ${err.message}`);
      }
      if (err) {
        return apiResponse(
          res,
          500,
          false,
          "Unexpected error occurred during file upload."
        );
      }
      next();
    });
  },
  uploadMedia // ⬅️ FIX: Pass controller function directly
);

module.exports = router;