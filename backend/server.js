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

// Allow all common local and deployed origins
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman/curl) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Express JSON Parser
app.use(express.json());

// Optionally serve frontend static files if desired (for local development)
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses')); // Note: budget and rates inside expenses for simplicity in this demo

const { MongoMemoryServer } = require('mongodb-memory-server');

// Database Connection
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    // Automatically use an in-memory database if a real one isn't provided
    if (!MONGO_URI || MONGO_URI.includes('localhost')) {
      console.log('⏳ Creating an in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      MONGO_URI = mongoServer.getUri();
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected to ' + (MONGO_URI.includes('localhost') ? 'Memory' : 'Cloud/Network'));
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
};

startServer();
