import mongoose from 'mongoose';
import User from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const count = await User.countDocuments();
    console.log(`📊 Total users in database: ${count}`);
    
    const users = await User.find({}).select('email name createdAt');
    console.log('👥 Users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Created: ${user.createdAt}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
