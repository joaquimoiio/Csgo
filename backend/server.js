const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const earningsRoutes = require('./src/routes/earnings');
const authRoutes = require('./src/routes/auth');
const tasksRoutes = require('./src/routes/tasks');
const { authenticateToken } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por 15 minutos
  message: {
    error: 'Muitas solicitações. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_GLOBAL'
  }
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(globalLimiter);

// Trust proxy se estiver atrás de um reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware para log de requests (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas públicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'CS2 Earnings Tracker API funcionando!',
    version: '2.0.0',
    features: ['Authentication', 'Rate Limiting', 'Security Headers'],
    endpoints: {
      auth: '/api/auth',
      earnings: '/api/earnings',
      tasks: '/api/tasks'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Proteger rotas de earnings com autenticação
app.use('/api/earnings', authenticateToken, earningsRoutes);
app.use('/api/tasks', tasksRoutes);

// Middleware de tratamento de erros 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de tratamento de erros global
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);

  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: isDevelopment ? error.message : 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}`);
  console.log(`🔐 Autenticação ativa`);
  console.log(`🛡️  Middlewares de segurança carregados`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔧 Modo desenvolvimento ativo`);
    console.log(`📝 Use o registro para criar novos usuários`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});