const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

// Environment variables
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root@123',
  database: process.env.DB_NAME || 'study_app_db'
};

// Initialize database
async function initializeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create sessions table with user relationship
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        duration INT NOT NULL,
        pause_reason TEXT,
        paused_time INT DEFAULT 0,
        topic VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create goals table with user relationship
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        goal_minutes INT NOT NULL,
        timeframe ENUM('daily', 'weekly', 'monthly') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Helper function to get database connection
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// User registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    await connection.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error in /api/register:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Get user from database
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
});

// User endpoints
app.get('/api/user', authenticateToken, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

// Study sessions endpoints
app.post('/api/sessions', authenticateToken, async (req, res) => {
  const session = req.body;
  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      'INSERT INTO sessions (user_id, start_time, end_time, duration, pause_reason, paused_time, topic) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        session.start,
        session.end,
        session.duration,
        session.pauseReason,
        session.pausedTime || 0,
        session.topic
      ]
    );
    
    const [inserted] = await connection.execute('SELECT LAST_INSERT_ID() as id');
    const sessionId = inserted[0].id;
    
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error in /api/sessions POST:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/sessions', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [sessions] = await connection.execute(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC',
      [req.user.id]
    );
    
    // Convert date strings to Date objects for consistency with frontend
    const formattedSessions = sessions.map(session => ({
      ...session,
      start: new Date(session.start_time),
      end: new Date(session.end_time)
    }));
    
    res.json(formattedSessions);
  } catch (error) {
    console.error('Error in /api/sessions GET:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
});

// Study goal endpoints
app.post('/api/goal', authenticateToken, async (req, res) => {
  const { goal, timeframe } = req.body;
  let connection;
  try {
    connection = await getConnection();
    
    // Check if goal exists
    const [existing] = await connection.execute(
      'SELECT * FROM goals WHERE user_id = ?',
      [req.user.id]
    );
    
    if (existing.length > 0) {
      // Update existing goal
      await connection.execute(
        'UPDATE goals SET goal_minutes = ?, timeframe = ? WHERE user_id = ?',
        [goal, timeframe, req.user.id]
      );
    } else {
      // Insert new goal
      await connection.execute(
        'INSERT INTO goals (user_id, goal_minutes, timeframe) VALUES (?, ?, ?)',
        [req.user.id, goal, timeframe]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/goal POST:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/goal', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [goals] = await connection.execute(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    
    if (goals.length > 0) {
      res.json({
        goal: goals[0].goal_minutes,
        timeframe: goals[0].timeframe
      });
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error in /api/goal GET:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });