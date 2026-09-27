const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.warn('⚠️ Running in offline/no-database mode. For database storage:');
    console.warn('   - Provide a free MongoDB Atlas connection string in backend/.env (MONGODB_URI)');
    console.warn('   - Or install & start MongoDB Community Server locally.');
  }
};

module.exports = connectDB;
