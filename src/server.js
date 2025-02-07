require('dotenv')
	.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const morgan = require('morgan');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require("./routes/userRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
