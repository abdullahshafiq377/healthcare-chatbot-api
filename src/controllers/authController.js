const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

exports.register = async (req, res) => {
	try {
		const {email, password, firstName, lastName} = req.body;
		const userExists = await User.findOne({email});
		
		if (userExists) {
			return res.status(400)
			          .json({message: 'User already exists'});
		}
		
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({email, password: hashedPassword, firstName, lastName});
		await newUser.save();
		
		// Send Welcome Email
		// const emailContent = `<h2>Welcome to Our App</h2>
		//     <p>Thank you for registering. Enjoy our services!</p>`;
		// sendEmail(email, "Welcome to Our App", emailContent);
		
		res.status(201)
		   .json({message: 'User registered successfully'});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

exports.login = async (req, res) => {
	try {
		const {email, password} = req.body;
		const user = await User.findOne({email});
		if (!user) {
			return res.status(400)
			          .json({message: 'Invalid credentials'});
		}
		
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400)
			          .json({message: 'Invalid credentials'});
		}
		
		const token = jwt.sign({userId: user._id, email: user.email, role: user.role}, process.env.JWT_SECRET,
		                       {expiresIn: '1h'});
		
		res.cookie('token', token, {httpOnly: true, secure: false});
		res.json({
			         message: 'Logged in successfully', token, user: {
				id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email
			}
		         });
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId)
		                       .select('-password');
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		res.json({user});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

exports.logout = (req, res) => {
	res.clearCookie('token');
	res.json({message: 'Logged out'});
};
