import mongoose from 'mongoose';

let mongod: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri === 'memory') {
      console.log('⚡ Initializing in-memory MongoDB instance for development/testing...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log(`✅ In-memory MongoDB started at: ${mongoUri}`);
      } catch (err: any) {
        console.error(
          '❌ Could not start mongodb-memory-server. If running in production (e.g. Render), please set the MONGODB_URI environment variable to a MongoDB Atlas cluster URI.',
          err.message
        );
        throw err;
      }
    }

    await mongoose.connect(mongoUri!);
    console.log(`✅ Connected to MongoDB successfully (${mongoose.connection.host})`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error: any) {
    console.error('Error disconnecting MongoDB:', error.message);
  }
};
