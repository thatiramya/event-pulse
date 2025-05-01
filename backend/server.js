
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');

// Database connection
const db = require('./config/db');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize database tables
const initDatabase = async () => {
  try {
    const connection = await db.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        total_seats INT NOT NULL,
        available_seats INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create seats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        row VARCHAR(5) NOT NULL,
        category VARCHAR(50) DEFAULT 'Standard',
        price DECIMAL(10, 2) NOT NULL,
        status ENUM('available', 'selected', 'booked') DEFAULT 'available',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_reference VARCHAR(20) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_id VARCHAR(255),
        payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    
    // Create booking_seats table (join table)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS booking_seats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        seat_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
};

// Initialize database tables
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Socket.IO event handling for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a specific event room for real-time updates
  socket.on('joinEvent', (eventId) => {
    socket.join(`event:${eventId}`);
    console.log(`Client joined event room: event:${eventId}`);
  });
  
  // Handle seat selection
  socket.on('selectSeat', async (data) => {
    const { eventId, seatId, userId, action } = data;
    
    try {
      // Update seat status in database based on action (select, deselect)
      const connection = await db.getConnection();
      const status = action === 'select' ? 'selected' : 'available';
      const userIdValue = action === 'select' ? userId : null;
      
      await connection.query(
        'UPDATE seats SET status = ?, user_id = ? WHERE id = ?',
        [status, userIdValue, seatId]
      );
      
      connection.release();
      
      // Emit to all clients in the event room that this seat status has changed
      io.to(`event:${eventId}`).emit('seatUpdated', {
        seatId,
        status,
        userId: userIdValue
      });
    } catch (error) {
      console.error('Error updating seat status:', error);
      socket.emit('error', { message: 'Failed to update seat status' });
    }
  });
  
  // Handle booking completion - update selected seats to booked
  socket.on('bookingComplete', async (data) => {
    const { eventId, seats, bookingId } = data;
    
    try {
      const connection = await db.getConnection();
      
      // Update all selected seats to booked
      for (const seat of seats) {
        await connection.query(
          'UPDATE seats SET status = ?, user_id = ? WHERE id = ?',
          ['booked', seat.userId, seat.id]
        );
        
        // Add to booking_seats table
        await connection.query(
          'INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)',
          [bookingId, seat.id]
        );
      }
      
      // Update available seats count in events table
      await connection.query(
        'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
        [seats.length, eventId]
      );
      
      connection.release();
      
      // Emit to all clients that these seats are now booked
      io.to(`event:${eventId}`).emit('seatsBooked', { seats });
    } catch (error) {
      console.error('Error completing booking:', error);
    }
  });
  
  // Handle chat support inquiries
  socket.on('supportMessage', (data) => {
    // In a real application, this would be connected to a support dashboard
    console.log('Support message received:', data);
    // For now, we'll just echo back a response
    socket.emit('supportResponse', {
      message: 'Thank you for your message. A support agent will respond shortly.',
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
