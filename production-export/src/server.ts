import app from './app';
import config from './config/environment';
import { testConnection, closePool } from './config/database';
import { createUploadDirectory } from './utils/fileSystem';
import { runMigrations } from './utils/migrations';
import { validateProjectSetup, printValidationResults } from './utils/validation';
import { ensureActiveDefaultConfiguration, syncConfigurationToAllUsers } from './utils/defaultConfiguration';

// Create upload directory if it doesn't exist
const initializeFileSystem = async (): Promise<void> => {
  try {
    await createUploadDirectory();
    console.log('✅ File system initialized');
  } catch (error) {
    console.error('❌ File system initialization failed:', error);
    throw error;
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Validate project setup
    const validationResult = await validateProjectSetup();
    printValidationResults(validationResult);
    
    if (!validationResult.isValid) {
      throw new Error('Project setup validation failed');
    }
    
    // Initialize file system
    await initializeFileSystem();
    
    // Test database connection
    await testConnection();
    
    // Run database migrations
    await runMigrations();

    // Ensure default configuration exists and sync to all users
    try {
      const activeConfig = await ensureActiveDefaultConfiguration();
      if (activeConfig) {
        await syncConfigurationToAllUsers(activeConfig.id, 'merge');
      }
    } catch (error) {
      console.error('Failed to ensure default configuration:', error);
    }
    
    // Start HTTP server
    const server = app.listen(config.port, () => {
      const host = process.env.HOST || 'localhost';
      const healthUrl = `http://${host}:${config.port}/health`;
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: ${healthUrl}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await closePool();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('💥 Server startup failed:', error);
  process.exit(1);
});
