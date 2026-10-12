import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { autoSeedIfEmpty } from './config/autoSeed';
import { CacheService } from './services/cacheService';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    CacheService.initialize();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Meme'd API server running on port ${PORT}`);
      console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down server...');
      server.close(async () => {
        await disconnectDB();
        console.log('✅ Server and Database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();

