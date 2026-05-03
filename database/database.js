import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectDatabase = async () => {
  try {
    const mongoUri =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_CLOUD
        : 
        process.env.MONGODB_LOCAL;

    if (!mongoUri) {
      throw new Error(
        'MongoDB connection string not found in environment variables',
      );
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('Database connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    if (process.env.DB_REQUIRED === 'true') {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }

    console.warn(
      `Database connection failed: ${error.message}. Starting without MongoDB because DB_REQUIRED is not true.`,
    );
  }
};

export default connectDatabase;
