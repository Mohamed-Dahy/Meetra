const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
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
// In production emit one JSON line per request so log drains can parse it.
// In development use morgan's 'dev' format (coloured, human-readable).
if (process.env.NODE_ENV === 'production') {
  morgan.token('body-size', (req) => req.headers['content-length'] || '0');
  app.use(morgan((tokens, req, res) => {
    return JSON.stringify({
      level: 'HTTP',
      method:  tokens.method(req, res),
      url:     tokens.url(req, res),
      status:  Number(tokens.status(req, res)),
      ms:      Number(tokens['response-time'](req, res)),
      ts:      new Date().toISOString(),
    });
  }));
} else {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));

connectDB();

app.get('/', (req, res) => {
  res.send('API is running');
});

// Health check — used by Docker HEALTHCHECK, UptimeRobot, and load balancers.
// Returns 200 with process uptime and timestamp so monitoring tools can verify
// the service is not just alive but actually accepting HTTP requests.
app.get('/meetra/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API v1 routes — canonical versioned paths used by all new clients.
// The frontend VITE_API_BASE_URL points to /meetra/v1 so every Axios call
// from React hits these routes.
// ---------------------------------------------------------------------------
app.use('/meetra/v1/auth', authRoutes);
app.use('/meetra/v1/meeting', meetingRoutes);
app.use('/meetra/v1/api/transcription', transcriptionRoutes);
app.use('/meetra/v1/api/export', exportPDFRoutes);
app.use('/meetra/v1/connections', connectionRoutes);
app.use('/meetra/v1/workspaces', workspaceRoutes);

// ---------------------------------------------------------------------------
// Legacy unversioned routes — kept for backward compat with any existing
// scripts, curl commands, or deployments that hit /meetra/* directly.
// These can be removed in a future breaking release.
// ---------------------------------------------------------------------------
app.use('/meetra/auth', authRoutes);
app.use('/meetra/meeting', meetingRoutes);
app.use('/meetra/api/transcription', transcriptionRoutes);
app.use('/meetra/api/export', exportPDFRoutes);
app.use('/meetra/connections', connectionRoutes);
app.use('/meetra/workspaces', workspaceRoutes);

// Global error handler — catches any unhandled errors thrown in route handlers.
// Uses the structured logger so production errors appear as JSON lines in log drains.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  logger.error(err.message || 'Internal server error', {
    status,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });
  res.status(status).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV || 'development' });
});



