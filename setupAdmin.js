// resetAdminPassword.js - Copy this ENTIRE code to a new file
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import 'dotenv/config';

// Import your Admin model
import Admin from './src/models/Admin.js';

// Connect to database
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || process.env.DB_CONNECTION_STRING || process.env.CONNECTION_STRING;
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('💡 Make sure your .env file has the correct database connection string');
    process.exit(1);
  }
};

const resetAdminPassword = async () => {
  console.log('🔄 Starting admin password reset...');
  
  await connectDB();
  
  try {
    // New password
    const newPassword = 'admin123'; // Change this to whatever you want
    
    // Find the existing admin by username
    console.log('🔍 Looking for admin with username "admin"...');
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin with username "admin" not found');
      console.log('🔍 Let me show you existing admins...');
      
      const allAdmins = await Admin.find({}, 'username email role isActive');
      if (allAdmins.length > 0) {
        console.log('📋 Existing admins:');
        allAdmins.forEach(admin => {
          console.log(`   - Username: ${admin.username}, Email: ${admin.email}, Role: ${admin.role}, Active: ${admin.isActive}`);
        });
        console.log('\n💡 Try changing the username in the script to match one of the above');
      } else {
        console.log('📋 No admins found in database');
        console.log('💡 You need to create an admin first. Try this:');
        console.log('   curl -X POST http://localhost:5000/api/auth/admin/create-initial \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -d \'{"username":"admin","email":"admin@vansglow.com","password":"admin123"}\'');
      }
      
      process.exit(0);
    }
    
    console.log(`✅ Found admin: ${admin.username} (${admin.email})`);
    
    // Hash the new password using the same method as your Admin model
    console.log('🔐 Hashing new password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the admin password
    console.log('💾 Updating admin password...');
    admin.password = hashedPassword;
    admin.updatedAt = new Date();
    await admin.save();
    
    console.log('\n✅ Admin password reset successfully!');
    console.log('🔑 Login Credentials:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🚀 You can now use these credentials in your desktop app!');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
resetAdminPassword().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});