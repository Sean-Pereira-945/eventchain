// Import required modules
const express = require('express');           // Express web framework
const mongoose = require('mongoose');         // MongoDB object modeling
const cors = require('cors');                // Cross-origin resource sharing
const http = require('http');                // HTTP server
const socketIo = require('socket.io');       // Real-time communication
require('dotenv').config();                  // Environment variables
const env = require('./src/config/env');

// Initialize Express application
const app = express();
const server = http.createServer(app);       // Create HTTP server
const isOriginAllowed = (origin) => !origin || env.clientOrigins.includes(origin);

const corsOptions = {
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
};

const io = socketIo(server, {                // Initialize Socket.io
    cors: {
        origin: env.clientOrigins,
        methods: ["GET", "POST"]
    }
});

// Middleware Configuration
app.use(cors(corsOptions));                  // Enable CORS for all routes
app.use(express.json({ limit: '10mb' }));    // Parse JSON bodies up to 10MB
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join user to their personal room for notifications
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Import and use routes
app.use('/api/auth', require('./src/routes/auth'));           // Authentication routes
app.use('/api/events', require('./src/routes/events'));       // Event management routes  
app.use('/api/users', require('./src/routes/users'));         // User management routes
app.use('/api/certificates', require('./src/routes/certificates')); // Certificate routes
app.use('/api/analytics', require('./src/routes/analytics'));  // Analytics routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err.stack);
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
            message: 'Something went wrong!',
            error: 'Internal Server Error'
        });
    }
    
    // In development, send full error details
    res.status(err.status || 500).json({
        message: err.message,
        error: err.stack
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
const PORT = env.port;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close();
        process.exit(0);
    });
});
