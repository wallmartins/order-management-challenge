import app from './app';
import { env, connectDatabase } from './config';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`Health check: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
