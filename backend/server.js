const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const http       = require('http');
const socketIo   = require('socket.io');
const path       = require('path');
const bcrypt = require('bcryptjs');
const User   = require('./models/User');
const bodyParser = require('body-parser');
const matchmaking = require('./routes/matchmaking'); 

// Import all routes and controllers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');  
const reportRoutes = require('./routes/reportRoutes'); 

// ➡️ CHAT MODULE IMPORTS
const chatRoutes = require('./routes/chatRoutes');
const { setSocketIO: setChatSocketIO } = require('./controllers/chatController');

// Existing Socket Setter Imports
const { setSocketIO: setSessionSocketIO } = require('./controllers/sessionController');
const { setSocket: setNotificationSocketIO } = require('./controllers/notificationController');


// dotenv configuration must be first
dotenv.config();

const app    = express(); 
const server = http.createServer(app);

// ✅ Create Socket.IO instance ONCE
const io     = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type, x-auth-token'],
    credentials: true,
  },
});

// ✅ Create namespaces from single instance
const sessionSocket      = io.of('/sessions');
const notificationSocket = io.of('/notifications');
const chatSocket         = io.of('/chat'); 

// Pass the socket instances to controllers
setSessionSocketIO(sessionSocket);
setNotificationSocketIO(notificationSocket);
setChatSocketIO(chatSocket); 


// ─── MIDDLEWARE ───────────────────────────────────────────────────
app.use(express.json());  
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

// Serve static files (images/media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, 'uploads/profile-pictures')));
app.use('/uploads/message-uploads', express.static(path.join(__dirname, 'uploads/message-uploads'))); 

// MongoDB connection (UNCHANGED)
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => { 
    console.log('Connected to MongoDB');
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PIC_URL } = process.env;
    // ... existing admin seeding logic ...
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// ─── ROUTES ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/matchmaking', matchmaking); 
app.use('/api/admin', adminRoutes);  
app.use('/api/reports', reportRoutes); 
app.use('/api/chat', chatRoutes); // ⬅️ CHAT ROUTES MOUNTED

// ✅ Socket.IO Connection Handlers 
sessionSocket.on('connection', (socket) => { console.log('A user connected to session socket'); socket.on('disconnect', () => { console.log('A user disconnected from session socket'); }); });
notificationSocket.on('connection', (socket) => { console.log('A user connected to notification socket'); socket.on('disconnect', () => { console.log('A user disconnected from notification socket'); }); });

// Default route
app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});
  
// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});