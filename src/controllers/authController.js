const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const {welcomeEmailTemplate} = require('../utils/email-templates');

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
		
		const emailBody = welcomeEmailTemplate.replace('{{firstName}}', `${newUser?.firstName}`);
		
		// Send email notification
		await sendEmail(
			newUser.email,
			'Welcome!',
			emailBody
		);
		
		res.status(201)
		   .json({message: 'User registered successfully'});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
		console.log(error);
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
		
		// Store user details in session
		req.session.user = {
			id: user._id,
			email: user.email,
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName,
		};
		
		res.json({
			         message: 'Logged in successfully',
			         user: req.session.user
		         });
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

exports.getProfile = async (req, res) => {
	try {
		if (!req.session.user) {
			return res.status(401)
			          .json({message: 'Unauthorized'});
		}
		
		const user = await User.findById(req.session.user.id)
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
	req.session.destroy((err) => {
		if (err) {
			return res.status(500)
			          .json({message: 'Logout failed'});
		}
		res.json({message: 'Logged out successfully'});
	});
};

exports.checkSession = (req, res) => {
	if (req.session.user) {
		return res.json({
			                isAuthenticated: true,
			                user: req.session.user
		                });
	}
	res.json({isAuthenticated: false});
};
