const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
dotenv.config();

const matchmaking = require('./routes/matchmaking');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatRoutes = require('./routes/chatRoutes');

const { setSocketIO: setChatSocketIO } = require('./controllers/chatController');
const { setSocketIO: setSessionSocketIO } = require('./controllers/sessionController');
const { setSocket: setNotificationSocketIO } = require('./controllers/notificationController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true,
  },
});

app.set('socketio', io);
const sessionSocket = io.of('/sessions');
const notificationSocket = io.of('/notifications');
const chatSocket = io.of('/chat');

setSessionSocketIO(sessionSocket);
setNotificationSocketIO(notificationSocket);
setChatSocketIO(chatSocket);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optimized static file serving
// This allows you to access images at: http://localhost:5000/uploads/profile-pictures/image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auto-seeding logic for the admin account
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'sonypetkar1911@gmail.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Sony@123', salt);
      
      await User.create({
        name: 'Sony Petkar',
        email: 'sonypetkar1911@gmail.com',
        password: hashedPassword,
        role: 'admin' 
      });
      console.log('Admin account automatically seeded.');
    } else {
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Error auto-seeding admin:', error);
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Run the seeder only after the database connects
    await seedAdmin(); 
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/matchmaking', matchmaking);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);

sessionSocket.on('connection', (socket) => { 
  console.log('A user connected to session socket'); 
  socket.on('disconnect', () => { console.log('A user disconnected from session socket'); }); 
});
notificationSocket.on('connection', (socket) => { 
  console.log('A user connected to notification socket'); 
  socket.on('disconnect', () => { console.log('A user disconnected from notification socket'); }); 
});

app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});