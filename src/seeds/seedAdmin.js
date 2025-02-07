require('dotenv')
	.config('../../.env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			dbName: process.env.DB_NAME,
		});
		
		const existingAdmin = await User.findOne({role: 'admin'});
		if (existingAdmin) {
			console.log('Admin user already exists.');
			return;
		}
		
		const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
		
		const admin = new User({
			                       firstName: 'Admin',
			                       lastName: 'User',
			                       email: process.env.ADMIN_EMAIL,
			                       password: hashedPassword,
			                       role: 'admin',
		                       });
		
		await admin.save();
		console.log('Admin user created successfully.');
	} catch (error) {
		console.error('Error seeding admin user:', error);
	} finally {
		mongoose.connection.close();
	}
};

seedAdmin();
