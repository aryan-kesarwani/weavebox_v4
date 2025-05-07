const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://weaveboxserver-production.up.railway.app',
    'https://arweave.net',
    'https://arweave.net/*'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Endpoint to get Google OAuth credentials
app.get('/api/config', (req, res) => {
  console.log('Config request received');
  
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    console.error('Missing environment variables:', {
      hasClientId: !!googleClientId,
      hasClientSecret: !!googleClientSecret
    });
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Missing required environment variables'
    });
  }

  console.log('Sending config response');
  res.json({
    googleClientId,
    googleClientSecret
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables status:', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    frontendUrl: process.env.FRONTEND_URL
  });
}); 