require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectRoutes = require('./routes/projects');
const authRoutes    = require('./routes/auth');
const authenticate  = require('./middleware/authenticate');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes (public)
app.use('/auth',     authRoutes);
app.use('/api/auth', authRoutes);

// Project Routes (protected by JWT)
app.use('/projects',     authenticate, projectRoutes);
app.use('/api/projects', authenticate, projectRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
