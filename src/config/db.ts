import mongoose from 'mongoose';

const DB_URL: string = process.env.MONGODB_URL!;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL, { dbName: 'simple-auth' });
    process.stdout.write('Database connected\n');
  } catch (e) {
    process.stdout.write(`Error ${e}\n`);
    process.exit(1);
  }
};

export default connectDB;
