// src/controllers/chatController.js

const Message = require('../models/Message'); 
const Session = require('../models/Session'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // Assuming User model might be needed for population reference

// ---------------- SOCKET.IO SETUP (Dependency Injection) ----------------

let chatSocket; 

const setSocketIO = (socketIO) => {
    chatSocket = socketIO;
    
    chatSocket.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        
        // User joins a chat room
        socket.on('join_room', (sessionId) => {
            socket.join(sessionId);
            console.log(`User ${userId} joined chat room: ${sessionId}`);
        });

        // Handle send_message
        socket.on('send_message', async (data) => {
            try {
                // Validate session
                const session = await Session.findById(data.conversationId);
                if (!session) return;

                // Find receiver
                const receiverId =
                    session.userId1.toString() === data.senderId
                        ? session.userId2
                        : session.userId1;

                const newMessage = new Message({
                    sessionId: data.conversationId,
                    senderId: data.senderId,
                    receiverId: receiverId,
                    content: data.content,
                    mediaUrl: data.mediaUrl || null,
                    mediaType: data.mediaType || null,
                });
                await newMessage.save();

                // ➡️ FIX: Use findById + populate + lean() to guarantee createdAt is a clean string/date object
                const messageWithSender = await Message.findById(newMessage._id)
                    .populate('senderId', 'name profilePicture')
                    .lean(); // Converts Mongoose document to plain JavaScript object

                if (!messageWithSender) return; // Safety check

                // Emit to room
                chatSocket.to(data.conversationId).emit('receive_message', messageWithSender);

            } catch (error) {
                console.error("Error saving/sending message:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected from chat: ${socket.id}`);
        });
    });
};

// ---------------- FILE UPLOAD SETUP ----------------

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'message-uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('file');

// ---------------- REST API: UPLOAD MEDIA ----------------

const uploadMedia = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded or file too large.' });
    }

    const mediaUrl = `http://localhost:5000/uploads/message-uploads/${req.file.filename}`;

    const mediaType =
        req.file.mimetype.startsWith('image') ? 'image' :
        req.file.mimetype.startsWith('video') ? 'video' :
        req.file.mimetype.startsWith('audio') ? 'audio' :
        null;

    res.json({
        msg: 'File uploaded successfully',
        filePath: mediaUrl,
        fileType: mediaType
    });
};

// ---------------- REST API: GET MESSAGE HISTORY ----------------

const getMessageHistory = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const messages = await Message.find({ sessionId })
            .sort('createdAt') 
            .populate('senderId', 'name profilePicture')
            .lean(); // Ensure dates are in a consistent format

        res.json(messages);

    } catch (err) {
        console.error('Error fetching message history:', err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    setSocketIO,
    getMessageHistory,
    uploadMedia,
    upload
};