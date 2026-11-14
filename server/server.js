const app = require('./src/app');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const { logger } = require('./src/utils/logger');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 FinWise Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      logger.info(`📡 API endpoint: http://localhost:${config.PORT}/api/v1`);
    });

    // Unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
      server.close(() => process.exit(1));
    });

    // Uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
      process.exit(1);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
