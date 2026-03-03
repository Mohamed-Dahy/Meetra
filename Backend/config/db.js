const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(uri,{dbname : "Meetra_database"});

    console.log('MongoDB connected');
  } catch (error) {
    console.error('Meetra_database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
