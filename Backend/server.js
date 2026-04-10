const express = require('express');
const cors = require('cors');
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

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



