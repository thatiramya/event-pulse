
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, admin } = require('../middleware/auth');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const qrCodeDir = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrCodeDir)) {
  fs.mkdirSync(qrCodeDir, { recursive: true });
}

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  const { eventId, seatIds, paymentId } = req.body;
  
  if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: 'Event ID and seat IDs are required' });
  }
  
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if event exists
      const [events] = await connection.query(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      
      if (events.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Check if seats exist and are available
      const [seats] = await connection.query(
        'SELECT * FROM seats WHERE id IN (?) AND event_id = ? AND status = "available"',
        [seatIds, eventId]
      );
      
      if (seats.length !== seatIds.length) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'One or more selected seats are not available' });
      }
      
      // Calculate total price
      const totalAmount = seats.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
      
      // Create booking
      const [bookingResult] = await connection.query(
        `INSERT INTO bookings (
          user_id, event_id, total_amount, payment_id, payment_status
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id,
          eventId,
          totalAmount,
          paymentId || null,
          paymentId ? 'completed' : 'pending'
        ]
      );
      
      const bookingId = bookingResult.insertId;
      
      // Generate QR code
      const qrCodeData = JSON.stringify({
        bookingId,
        eventId,
        userId: req.user.id,
        seats: seats.map(seat => ({
          id: seat.id,
          row: seat.row,
          number: seat.seat_number
        }))
      });
      
      const qrCodeFilename = `booking-${bookingId}.png`;
      const qrCodePath = path.join(qrCodeDir, qrCodeFilename);
      
      await QRCode.toFile(qrCodePath, qrCodeData);
      
      // Update booking with QR code path
      await connection.query(
        'UPDATE bookings SET qr_code = ? WHERE id = ?',
        [`/uploads/qrcodes/${qrCodeFilename}`, bookingId]
      );
      
      // Add booking details
      for (const seat of seats) {
        await connection.query(
          'INSERT INTO booking_details (booking_id, seat_id, price) VALUES (?, ?, ?)',
          [bookingId, seat.id, seat.price]
        );
        
        // Update seat status
        await connection.query(
          'UPDATE seats SET status = "booked" WHERE id = ?',
          [seat.id]
        );
      }
      
      // Update available seats count for the event
      await connection.query(
        'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
        [seats.length, eventId]
      );
      
      await connection.commit();
      connection.release();
      
      res.status(201).json({
        message: 'Booking created successfully',
        bookingId,
        totalAmount,
        qrCode: `/uploads/qrcodes/${qrCodeFilename}`
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings
// @desc    Get all bookings for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [bookings] = await connection.query(
      `SELECT b.*, e.title as event_title, e.date, e.time, e.location, e.image
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    
    // Get booking details (seats) for each booking
    for (let booking of bookings) {
      const [details] = await connection.query(
        `SELECT bd.*, s.row, s.seat_number, s.category
         FROM booking_details bd
         JOIN seats s ON bd.seat_id = s.id
         WHERE bd.booking_id = ?`,
        [booking.id]
      );
      
      booking.seats = details;
    }
    
    connection.release();
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/:id
// @desc    Get a specific booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Check if booking exists and belongs to the user (or admin)
    let query = `
      SELECT b.*, e.title as event_title, e.date, e.time, e.location, e.image
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = ?
    `;
    
    let params = [req.params.id];
    
    // If not admin, restrict to user's own bookings
    if (req.user.role !== 'admin') {
      query += ' AND b.user_id = ?';
      params.push(req.user.id);
    }
    
    const [bookings] = await connection.query(query, params);
    
    if (bookings.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const booking = bookings[0];
    
    // Get booking details (seats)
    const [details] = await connection.query(
      `SELECT bd.*, s.row, s.seat_number, s.category
       FROM booking_details bd
       JOIN seats s ON bd.seat_id = s.id
       WHERE bd.booking_id = ?`,
      [booking.id]
    );
    
    booking.seats = details;
    
    // Get user details
    const [users] = await connection.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [booking.user_id]
    );
    
    if (users.length > 0) {
      booking.user = users[0];
    }
    
    connection.release();
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if booking exists and belongs to the user (or admin)
      let query = 'SELECT * FROM bookings WHERE id = ?';
      let params = [req.params.id];
      
      // If not admin, restrict to user's own bookings
      if (req.user.role !== 'admin') {
        query += ' AND user_id = ?';
        params.push(req.user.id);
      }
      
      const [bookings] = await connection.query(query, params);
      
      if (bookings.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      const booking = bookings[0];
      
      // Don't allow cancellation of already cancelled bookings
      if (booking.booking_status === 'cancelled') {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Booking is already cancelled' });
      }
      
      // Get booking details to release seats
      const [details] = await connection.query(
        'SELECT * FROM booking_details WHERE booking_id = ?',
        [booking.id]
      );
      
      // Update booking status
      await connection.query(
        'UPDATE bookings SET booking_status = "cancelled" WHERE id = ?',
        [booking.id]
      );
      
      // Release seats
      for (const detail of details) {
        await connection.query(
          'UPDATE seats SET status = "available" WHERE id = ?',
          [detail.seat_id]
        );
      }
      
      // Update available seats count for the event
      await connection.query(
        'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
        [details.length, booking.event_id]
      );
      
      await connection.commit();
      connection.release();
      
      res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/admin/all
// @desc    Get all bookings (admin only)
// @access  Private (Admin only)
router.get('/admin/all', [auth, admin], async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [bookings] = await connection.query(`
      SELECT b.*, 
             e.title as event_title, e.date as event_date,
             u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    
    connection.release();
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
