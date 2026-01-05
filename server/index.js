require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Import routers
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const employeeRouter = require('./routes/employee');
const teamleadRouter = require('./routes/teamlead');
const smmRouter = require('./routes/smm');

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running', status: 'healthy' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/teamlead', teamleadRouter);
app.use('/api/smm', smmRouter);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
