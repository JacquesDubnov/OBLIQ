import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cors from 'cors';
import { db } from './services/database.js';
import chatsRouter from './routes/chats.js';
import messagesRouter from './routes/messages.js';
import contactsRouter from './routes/contacts.js';
import resetRouter from './routes/reset.js';
import translateRouter from './routes/translate.js';
import viewsRouter from './routes/views.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
db.initialize();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OBLIQ Demo Server Running' });
});

app.use('/api/chats', chatsRouter);
app.use('/api/chats', messagesRouter); // Messages are nested under chats
app.use('/api/messages', messagesRouter); // Also expose at /api/messages for status updates
app.use('/api/contacts', contactsRouter);
app.use('/api/reset', resetRouter);
app.use('/api/translate', translateRouter);
app.use('/api/views', viewsRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
