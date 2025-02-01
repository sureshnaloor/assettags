import { closeConnection } from './mongodb-client';

export function setupGracefulShutdown() {
  // Handle normal termination
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing MongoDB connection...');
    await closeConnection();
    process.exit(0);
  });

  // Handle interruption
  process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing MongoDB connection...');
    await closeConnection();
    process.exit(0);
  });
} 