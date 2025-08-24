import mongoose from 'mongoose';
import "dotenv/config";


const connectDB = async () => {
  const uri = "mongodb+srv://jkpanchal2120:YKpKVDyritdDf9Nj@cluster0.lb7rtr0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//    process.env.MONGO_URI;


  if (!uri) throw new Error('MONGO_URI is not set');

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// ✅ Export as ES Module
export default connectDB;
