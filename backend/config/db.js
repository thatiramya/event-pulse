const mysql = require('mysql2/promise');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and make sure all required variables are set');
  process.exit(1);
}

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eventpulse_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Please check your database credentials and make sure MySQL server is running');
    process.exit(1);
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Check if database tables exist, if not create them
    const connection = await pool.getConnection();

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table initialized');

    // Events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        date DATE NOT NULL,
        time VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        total_seats INT NOT NULL,
        available_seats INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Events table initialized');

    // Seats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        row VARCHAR(10) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status ENUM('available', 'selected', 'booked') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    console.log('Seats table initialized');

    // Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_id VARCHAR(255),
        payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        booking_status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
        qr_code VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    console.log('Bookings table initialized');

    // Booking details table (for seat-booking relationship)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS booking_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        seat_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
      )
    `);
    console.log('Booking details table initialized');

    // Update mock events data with future dates and adjusted prices
    const [existingEvents] = await connection.query('SELECT COUNT(*) as count FROM events');
    
    if (existingEvents[0].count === 0) {
      console.log('No events found in database, initializing with sample data');
      
      // Sample events with future dates (after May 2025) and prices between 700-2000
      const sampleEvents = [
        {
          title: "Coldplay: Music of the Spheres World Tour",
          description: "Experience Coldplay's spectacular Music of the Spheres World Tour live. An unforgettable evening featuring their greatest hits and new music.",
          image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          date: "2025-05-15",
          time: "7:00 PM",
          location: "DY Patil Stadium, Mumbai",
          price: 1800,
          category: "Concert",
          total_seats: 45000,
          available_seats: 45000
        },
        {
          title: "International Film Festival",
          description: "A celebration of cinema from around the world, featuring award-winning films, director Q&As, and exclusive screenings.",
          image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          date: "2025-06-05",
          time: "Various Times",
          location: "PVR Cinema, Juhu, Mumbai",
          price: 1200,
          category: "Film",
          total_seats: 1000,
          available_seats: 1000
        },
        {
          title: "The Phantom of the Opera",
          description: "Andrew Lloyd Webber's iconic musical comes to India for the first time. A tale of love, mystery and passion.",
          image: "https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
          date: "2025-07-20",
          time: "7:30 PM",
          location: "NCPA, Nariman Point, Mumbai",
          price: 1500,
          category: "Theater",
          total_seats: 800,
          available_seats: 800
        },
        {
          title: "Tech Conference 2025",
          description: "Join industry leaders and innovators to explore the latest in AI, blockchain, and sustainable tech solutions.",
          image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          date: "2025-08-15",
          time: "9:00 AM - 6:00 PM",
          location: "Jio World Convention Centre, BKC, Mumbai",
          price: 2000,
          category: "Education",
          total_seats: 2000,
          available_seats: 2000
        },
        {
          title: "Food & Wine Festival",
          description: "A gastronomic journey featuring celebrity chefs, wine tastings, cooking demonstrations, and the finest cuisines.",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
          date: "2025-09-03",
          time: "12:00 PM - 10:00 PM",
          location: "Mahalaxmi Race Course, Mumbai",
          price: 1300,
          category: "Food & Drink",
          total_seats: 3000,
          available_seats: 3000
        },
        {
          title: "Stand-Up Comedy Night",
          description: "Laugh out loud with India's top comedians in a night of wit, humor, and hilarious observations.",
          image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
          date: "2025-06-25",
          time: "8:00 PM",
          location: "Bal Gandharva Rang Mandir, Mumbai",
          price: 800,
          category: "Comedy",
          total_seats: 500,
          available_seats: 500
        },
        {
          title: "Music Festival 2025",
          description: "Three days of non-stop music with the best artists from around the world across multiple stages.",
          image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          date: "2025-10-15",
          time: "2:00 PM - 11:00 PM",
          location: "Nesco Center, Goregaon, Mumbai",
          price: 1700,
          category: "Concert",
          total_seats: 5000,
          available_seats: 5000
        },
        {
          title: "Ballet: Swan Lake",
          description: "Experience the timeless beauty of Tchaikovsky's masterpiece performed by the Royal Russian Ballet.",
          image: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
          date: "2025-11-05",
          time: "7:00 PM",
          location: "Royal Opera House, Mumbai",
          price: 1900,
          category: "Theater",
          total_seats: 500,
          available_seats: 500
        },
        {
          title: "Street Food Festival",
          description: "Experience the diverse flavors of street food from around the world in one vibrant location.",
          image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          date: "2025-05-28",
          time: "11:00 AM - 9:00 PM",
          location: "Carter Road, Bandra, Mumbai",
          price: 700,
          category: "Food & Drink",
          total_seats: 2000,
          available_seats: 2000
        }
      ];
      
      // Insert sample events
      for (const event of sampleEvents) {
        const [result] = await connection.query(
          `INSERT INTO events (
            title, description, image, date, time, location, 
            price, category, total_seats, available_seats
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.title,
            event.description,
            event.image,
            event.date,
            event.time,
            event.location,
            event.price,
            event.category,
            event.total_seats,
            event.available_seats
          ]
        );
        
        const eventId = result.insertId;
        console.log(`Added event: ${event.title} with ID: ${eventId}`);
        
        // Generate basic seats for each event
        // This is simplified - in a real app you'd have more complex seating arrangements
        const rows = ['A', 'B', 'C', 'D'];
        const seatsPerRow = 10; // Just create 40 sample seats per event
        
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            // Set different prices based on row (front rows more expensive)
            const seatPrice = event.price * (1 - (rowIndex * 0.1));
            
            await connection.query(
              `INSERT INTO seats (event_id, seat_number, row, category, price, status) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                eventId,
                seatNum.toString(),
                row,
                rowIndex < 2 ? 'Premium' : 'Standard',
                seatPrice,
                'available'
              ]
            );
          }
        }
      }
      
      console.log('Sample events and seats data initialized');
    } else {
      console.log('Events already exist in database, skipping initialization');
    }

    console.log('Database tables and data initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Failed to initialize database tables:', error.message);
    process.exit(1);
  }
};

// Execute database initialization
testConnection().then(() => {
  initDatabase().catch(err => {
    console.error('Database initialization error:', err);
  });
});

module.exports = pool;
