import { setupGracefulShutdown } from '@/lib/shutdown-handler';

if (process.env.NODE_ENV === 'production') {
  setupGracefulShutdown();
} 