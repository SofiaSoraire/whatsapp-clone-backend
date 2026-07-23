import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
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

// Obtener directorio actual (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================================
// CARGA MANUAL DEL ARCHIVO .env (independiente de dotenv)
// ========================================================
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key) {
          process.env[key.trim()] = value;
        }
      }
    }
    console.log('✅ Archivo .env cargado manualmente');
  } else {
    console.warn('⚠️ No se encontró el archivo .env en:', envPath);
  }
} catch (error) {
  console.error('❌ Error al leer .env:', error);
}

// Mostrar variables críticas (para depuración)
console.log('🔍 MONGO_URI:', process.env.MONGO_URI || '❌ No definida');
console.log('🔍 PORT:', process.env.PORT || '5001 (default)');
console.log('🔍 CLIENT_URL:', process.env.CLIENT_URL || '❌ No definida');

// ========================================================
// INICIALIZAR APP
// ========================================================
const app = express();
const server = http.createServer(app);

// ========================================================
// CONFIGURACIÓN CORS (permite orígenes específicos y fallback)
// ========================================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://whatsapp-clone-frontend-xi.vercel.app',
  'http://localhost:5173',
  'https://whatsapp-clone-frontend-me06fh7xh-sofiasoraires-projects.vercel.app'
].filter(Boolean);

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ========================================================
// OTROS MIDDLEWARES GLOBALES
// ========================================================
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intente más tarde.'
}));

// Logging de todas las peticiones (para depuración)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ========================================================
// RUTAS DE LA API
// ========================================================
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

// ========================================================
// CONEXIÓN A MONGODB
// ========================================================
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp';
mongoose.connect(mongoURI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ========================================================
// MANEJO DE ERRORES (siempre al final)
// ========================================================
app.use(errorHandler);

// ========================================================
// INICIO DEL SERVIDOR
// ========================================================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 API disponible en http://localhost:${PORT}/api`);
});