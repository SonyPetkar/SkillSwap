const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res
      .status(401)
      .json({ msg: "No authentication token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fix: Your login controller nests the data under a "user" key
    // so decoded.user contains { id, role }
    req.user = decoded.user;

    const dbUser = await User.findById(req.user.id).select("status");
    
    if (!dbUser) {
      return res.status(404).json({ msg: "User no longer exists" });
    }

    if (dbUser.status === "blocked") {
      return res
        .status(403)
        .json({ msg: "Your account has been blocked. Contact support." });
    }

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

const ensureAdmin = (req, res, next) => {
  // Now this will work correctly because req.user is { id, role }
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied: Admins only" });
  }
  next();
};

module.exports = {
  verifyToken,
  ensureAdmin,
};