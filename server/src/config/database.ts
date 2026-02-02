import mongoose from 'mongoose';

const MONGODB_URI =
  'mongodb+srv://suryanshbusinesswork:education54@sibera-box.ofemtir.mongodb.net/exyconn-mail-server?retryWrites=true&w=majority';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default mongoose;
