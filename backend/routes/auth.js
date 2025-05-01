
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
  ],
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const connection = await pool.getConnection();
      
      // Check if user exists
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        connection.release();
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into database
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      connection.release();

      // Generate JWT token
      const payload = {
        id: result.insertId,
        name,
        email,
        role: 'user'
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const connection = await pool.getConnection();
      
      // Check if user exists
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        connection.release();
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        connection.release();
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      connection.release();

      // Generate JWT token
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res) => {
    // This would normally send an email with a reset link/token
    // For this demo, we'll just return a success message
    
    const { email } = req.body;
    
    try {
      const connection = await pool.getConnection();
      
      // Check if user exists
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      connection.release();

      if (users.length === 0) {
        // Don't reveal that the user doesn't exist
        return res.json({ message: 'If your email is registered, you will receive a password reset link' });
      }

      // In a real app, generate a reset token and send an email
      
      res.json({ message: 'If your email is registered, you will receive a password reset link' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  [
    check('token', 'Token is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
  ],
  async (req, res) => {
    // In a real app, verify the reset token and update the password
    // For this demo, we'll just return a success message
    
    res.json({ message: 'Password has been reset successfully' });
  }
);

module.exports = router;
