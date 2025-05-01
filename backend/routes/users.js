
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const pool = require('../config/db');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
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

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    check('name', 'Name is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, currentPassword, newPassword } = req.body;
    
    try {
      const connection = await pool.getConnection();
      
      // Get current user data
      const [users] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [req.user.id]
      );
      
      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = users[0];
      
      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          connection.release();
          return res.status(400).json({ message: 'Current password is required' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          connection.release();
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update name and password
        await connection.query(
          'UPDATE users SET name = ?, password = ? WHERE id = ?',
          [name, hashedPassword, req.user.id]
        );
      } else {
        // Update name only
        await connection.query(
          'UPDATE users SET name = ? WHERE id = ?',
          [name, req.user.id]
        );
      }
      
      connection.release();
      
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    connection.release();
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id/role
// @desc    Change user role (admin only)
// @access  Private (Admin only)
router.put('/:id/role', [auth, admin], async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Valid role is required' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [users] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update role
    await connection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, req.params.id]
    );
    
    connection.release();
    
    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
