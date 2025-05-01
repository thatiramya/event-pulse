
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
  }
}).single('image');

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    let query = 'SELECT * FROM events';
    let params = [];
    
    // Add category filter if provided
    if (req.query.category) {
      query += ' WHERE category = ?';
      params.push(req.query.category);
    }
    
    // Add ordering
    query += ' ORDER BY date ASC';
    
    const [events] = await connection.query(query, params);
    connection.release();
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get event details
    const [events] = await connection.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );
    
    if (events.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get seats for this event
    const [seats] = await connection.query(
      'SELECT * FROM seats WHERE event_id = ? ORDER BY row, seat_number',
      [req.params.id]
    );
    
    connection.release();
    
    // Combine event and seats
    const event = events[0];
    event.seats = seats;
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Admin only)
router.post('/', [auth, admin], (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    const {
      title,
      description,
      date,
      time,
      location,
      price,
      category,
      totalSeats
    } = req.body;
    
    // Validate required fields
    if (!title || !date || !time || !location || !price || !category || !totalSeats) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
      const connection = await pool.getConnection();
      
      // Insert event
      const [result] = await connection.query(
        `INSERT INTO events (
          title, description, image, date, time, location, 
          price, category, total_seats, available_seats
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          req.file ? `/uploads/events/${req.file.filename}` : null,
          date,
          time,
          location,
          price,
          category,
          totalSeats,
          totalSeats // initially all seats are available
        ]
      );
      
      const eventId = result.insertId;
      
      // Generate seats for this event
      // This is a simplified example - you would customize this based on your venue layout
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const seatsPerRow = Math.ceil(totalSeats / rows.length);
      
      // Prepare seat insertion query
      let seatValues = [];
      let seatParams = [];
      
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          if (seatValues.length >= totalSeats) break;
          
          // Determine seat category and price based on row
          let category = 'Standard';
          let seatPrice = Number(price);
          
          if (rowIndex < 2) {
            category = 'Premium';
            seatPrice = seatPrice * 1.5;
          } else if (rowIndex < 4) {
            category = 'Executive';
            seatPrice = seatPrice * 1.2;
          }
          
          seatValues.push('(?, ?, ?, ?, ?, ?)');
          seatParams.push(
            eventId,
            seatNum.toString(),
            row,
            category,
            seatPrice,
            'available'
          );
        }
      }
      
      // Insert all seats in a single query
      if (seatValues.length > 0) {
        await connection.query(
          `INSERT INTO seats (event_id, seat_number, row, category, price, status) VALUES ${seatValues.join(', ')}`,
          seatParams
        );
      }
      
      connection.release();
      
      res.status(201).json({ 
        message: 'Event created successfully',
        eventId
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put('/:id', [auth, admin], (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const connection = await pool.getConnection();
      
      // Check if event exists
      const [events] = await connection.query(
        'SELECT * FROM events WHERE id = ?',
        [req.params.id]
      );
      
      if (events.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const event = events[0];
      
      // Prepare update fields
      const {
        title,
        description,
        date,
        time,
        location,
        price,
        category,
        available_seats
      } = req.body;
      
      const updateFields = {};
      
      if (title) updateFields.title = title;
      if (description) updateFields.description = description;
      if (date) updateFields.date = date;
      if (time) updateFields.time = time;
      if (location) updateFields.location = location;
      if (price) updateFields.price = price;
      if (category) updateFields.category = category;
      if (available_seats) updateFields.available_seats = available_seats;
      
      // If new image uploaded
      if (req.file) {
        updateFields.image = `/uploads/events/${req.file.filename}`;
      }
      
      // Build update query
      const fields = Object.keys(updateFields);
      if (fields.length === 0) {
        connection.release();
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      const updates = fields.map(field => `${field} = ?`).join(', ');
      const params = [...Object.values(updateFields), req.params.id];
      
      await connection.query(
        `UPDATE events SET ${updates} WHERE id = ?`,
        params
      );
      
      connection.release();
      
      res.json({ message: 'Event updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );
    
    if (events.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete the event (will cascade to seats)
    await connection.query(
      'DELETE FROM events WHERE id = ?',
      [req.params.id]
    );
    
    connection.release();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
