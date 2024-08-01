const mongoose = require('mongoose');

// MongoDB URI from environment variables
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webassignment'; 

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
