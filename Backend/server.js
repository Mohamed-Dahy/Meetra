const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./Routes/authRoutes');
const meetingRoutes = require('./Routes/meetingRoutes');
const transcriptionRoutes = require('./Routes/transcriptionRoutes');
const exportPDFRoutes = require('./Routes/exportPDFRoutes');
const connectionRoutes = require('./Routes/connectionRoutes');
const workspaceRoutes = require('./Routes/workspaceRoutes')

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or same-origin requests (no Origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

connectDB();

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/meetra/auth', authRoutes);
app.use('/meetra/meeting', meetingRoutes);
app.use('/meetra/api/transcription', transcriptionRoutes);
app.use('/meetra/api/export', exportPDFRoutes);
app.use('/meetra/connections',connectionRoutes)
app.use('/meetra/workspaces',workspaceRoutes)

// Global error handler — catches any unhandled errors thrown in route handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



