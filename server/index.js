const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Endpoint to get Google OAuth credentials
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 