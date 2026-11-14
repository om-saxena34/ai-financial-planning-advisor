const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { morganMiddleware, logger } = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging via Morgan -> Winston
app.use(morganMiddleware);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'FinWise API',
    version: '1.0.0',
    description: 'AI-Powered Personal Financial Planning Advisor API',
    docs: '/api/v1/health',
  });
});

// Mount API v1 routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
