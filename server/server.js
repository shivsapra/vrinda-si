import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (privacy safe - never logs sensitive payloads or headers)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next;
  next();
});

// Serve frontend static assets
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API Routes
app.use('/api', chatRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_actual_api_key' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  res.json({
    status: 'ok',
    appName: 'VRINDA AI',
    tagline: 'Your Personal AI Companion',
    configuredModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
    apiKeyConfigured: hasKey,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Client-side SPA routing fallback: send index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌿 =================================================`);
  console.log(`🌿 VRINDA AI — Your Personal AI Companion is running!`);
  console.log(`🌿 URL: http://localhost:${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌿 Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'}`);
  console.log(`🌿 API Key configured: ${Boolean(process.env.GEMINI_API_KEY) ? 'YES ✓' : 'NO ✗'}`);
  console.log(`🌿 =================================================`);
});
