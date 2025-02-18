require('dotenv')
	.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const morgan = require('morgan');
const {deleteOldConversations} = require('./utils/cleanupService');

const app = express();

// Connect to MongoDB
connectDB()
	.then(() => {
		deleteOldConversations(); // Run cleanup at startup
		setInterval(deleteOldConversations, 24 * 60 * 60 * 1000); // Run cleanup every 24 hours
	});

// Middleware
app.use(express.json());
app.set('trust proxy', 1); // Trust the first proxy
app.use(cookieParser());
app.use(cors({
	             origin: ['http://localhost:3000', 'http://18.212.19.72'],
	             credentials: true
             }));

// **Fix: Provide a valid secret**
app.use(
	session({
		        secret: process.env.SESSION_SECRET, // Make sure this is defined
		        resave: false,
		        saveUninitialized: false,
		        store: MongoStore.create({
			                                 mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB
			                                 collectionName: 'sessions',
			                                 dbName: process.env.DB_NAME,
		                                 }),
		        cookie: {
			        httpOnly: true,
			        secure: true,
			        sameSite: 'none',
			        maxAge: 1000 * 60 * 60 * 24, // 1 day
		        },
	        })
);

app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
	res.send('Hello World!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
