import express from 'express';
import connectDB from './database.js';
import dotenv from 'dotenv';
import errorMiddleware from '../middlewares/errorHandler.js';
import appRoutes from '../routes/index.js';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import socketHandler from '../services/socket/socketHandler.js';
import helmet from 'helmet';

const app = express();
dotenv.config();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket Handlers
socketHandler(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(helmet());

// Database Connection
process.env.NODE_ENV !== 'test' && (await connectDB());
// await connectDB();

// Global error middleware
app.use('/api', appRoutes);
app.use(errorMiddleware);

app.get('/', (_, res) => {
  res.send('Welcome to our Chat API');
});

// Not found request
app.all('*', (req, res, _) => {
  res.status(404).send(`Can't find ${req.originalUrl} on this server!`);
});

export default server;
