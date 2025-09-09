const jwt = require('jsonwebtoken');
const { query } = require('../models/database');

// Chave secreta do JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN' 
      });
    }

    // Verificar se o token é válido
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se a sessão ainda existe no banco
    const sessionResult = await query(
      'SELECT s.*, u.is_active FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = $1 AND s.expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Sessão expirada ou inválida',
        code: 'INVALID_SESSION' 
      });
    }

    const session = sessionResult.rows[0];

    // Verificar se o usuário ainda está ativo
    if (!session.is_active) {
      return res.status(401).json({ 
        error: 'Usuário desativado',
        code: 'USER_DISABLED' 
      });
    }

    // Buscar dados completos do usuário
    const userResult = await query(
      'SELECT id, username, email, full_name, is_active, last_login FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND' 
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = userResult.rows[0];
    req.session = session;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED' 
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR' 
    });
  }
};

// Middleware opcional (não bloqueia se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Usar o middleware de autenticação normal
    await authenticateToken(req, res, next);
  } catch (error) {
    // Em caso de erro, continuar sem usuário
    req.user = null;
    next();
  }
};

// Função para gerar token JWT
const generateToken = (userId, sessionId) => {
  return jwt.sign(
    { 
      userId, 
      sessionId,
      type: 'access' 
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Função para criar sessão
const createSession = async (userId, token, ipAddress, userAgent) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

  const result = await query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent) 
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, token, expiresAt, ipAddress, userAgent]
  );

  return result.rows[0].id;
};

// Função para revogar sessão
const revokeSession = async (sessionId) => {
  await query('DELETE FROM user_sessions WHERE id = $1', [sessionId]);
};

// Função para revogar todas as sessões de um usuário
const revokeAllUserSessions = async (userId) => {
  await query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
};

// Função para limpar sessões expiradas
const cleanExpiredSessions = async () => {
  const result = await query('DELETE FROM user_sessions WHERE expires_at < NOW()');
  console.log(`${result.rowCount} sessões expiradas removidas`);
  return result.rowCount;
};

// Executar limpeza de sessões expiradas a cada hora
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  createSession,
  revokeSession,
  revokeAllUserSessions,
  cleanExpiredSessions,
  JWT_SECRET
};