require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

const seedPassword = 'Admin@123';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@rbac.dev';
    const adminName = 'System Admin';
    const hashedPassword = await bcrypt.hash(seedPassword, 12);

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin record already exists in Admin collection:', existingAdmin.email);

      await Admin.updateOne(
        { _id: existingAdmin._id },
        {
          $set: {
            name: existingAdmin.name || adminName,
            password: hashedPassword,
          },
        }
      );

      await User.findOneAndUpdate(
        { email: adminEmail },
        {
          $set: {
            name: existingAdmin.name || adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            status: 'approved',
            rejectionReason: null,
            approvedAt: new Date(),
            approvedBy: null,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: false,
          setDefaultsOnInsert: true,
        }
      );

      console.log('Synced seeded admin credentials to User and Admin records.');
      process.exit(0);
    }

    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
    });

    const user = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'approved',
    });

    console.log('Admin created in Admin collection and corresponding User created:');
    console.log('Email:   ', adminEmail);
    console.log('Password:', seedPassword);
    console.log('Admin ID:', admin._id);
    console.log('User ID: ', user._id);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
