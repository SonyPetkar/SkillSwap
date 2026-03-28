const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email: email.toLowerCase(), password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const loginUser = async (req, res) => {
  // DEBUG LOG
  console.log("LOGIN ATTEMPT RECEIVED:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (user.isBlocked) {
      return res.status(403).json({ msg: 'Your account has been blocked due to multiple reports.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      name: user.name,
      email: user.email,
      id: user._id,
      role: user.role,
      profilePicture: user.profilePicture
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { registerUser, loginUser };