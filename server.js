import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Importar middlewares y servicios
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './services/loggerService.js';
import { setupSocket } from './sockets/socketHandler.js';

// Obtener directorio actual (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('🔑 API Key cargada:', process.env.OPENAI_API_KEY ? 'Sí ✅' : 'No ❌');
console.log('Valor:', process.env.OPENAI_API_KEY);

// Inicializar app
const app = express();
const server = http.createServer(app);

// ======================
// CONFIGURACIÓN CORS (obligatoria ANTES de las rutas)
// ======================
// Lista de orígenes permitidos (frontend en Vercel y desarrollo local)
const allowedOrigins = [
  process.env.CLIENT_URL,      // URL del frontend en producción (ej: https://...vercel.app)
  'http://localhost:5173'       // desarrollo local
].filter(Boolean);              // elimina valores undefined

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
      callback(new Error(`Origen ${origin} no permitido por CORS`));
    }
  },
  credentials: true,            // permite enviar cookies/tokens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));   // manejar preflight

// ======================
// CONFIGURACIÓN DE SOCKET.IO (con CORS coherente)
// ======================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
  }
});

// ======================
// OTROS MIDDLEWARES GLOBALES
// ======================
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intente más tarde.'
}));

// Logging de todas las peticiones
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ======================
// RUTAS DE LA API
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Ruta de salud (health check)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// ======================
// SOCKET.IO
// ======================
setupSocket(io);

// ======================
// CONEXIÓN A MONGODB
// ======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ======================
// MANEJO DE ERRORES (siempre al final)
// ======================
app.use(errorHandler);

// ======================
// INICIO DEL SERVIDOR
// ======================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 API disponible en http://localhost:${PORT}/api`);
});