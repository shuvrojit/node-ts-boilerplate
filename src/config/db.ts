import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const DB_URL = process.env.MONGODB_URL;
    if (!DB_URL) {
      throw new Error('MONGODB_URL is not defined in the environment');
    }
    await mongoose.connect(DB_URL, { dbName: 'simple-auth' });
    process.stdout.write('Database connected\n');
  } catch (e) {
    process.stdout.write(`Error ${e}\n`);
    process.exit(1);
  }
};

export default connectDB;
