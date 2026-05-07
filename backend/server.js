require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Security Middleware
app.use(helmet());

// Allow all origins (student demo)
app.use(cors({
  origin: true,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Express JSON Parser
app.use(express.json());

// Serve frontend static files (for local development)
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Serverless-compatible MongoDB Connection ─────────────────────────────────
// Vercel serverless functions are stateless — each request may spin up a new
// instance. We cache the connection on the global object so it's reused across
// warm invocations (avoids "too many connections" and slow cold starts).
let cachedConnection = global._mongooseConnection;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set!');
  }

  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  cachedConnection = conn;
  global._mongooseConnection = conn;
  console.log('✅ MongoDB Connected');
  return conn;
}

// Middleware: ensure DB is connected before every API request
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed. Please try again.' });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Local development server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
