const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { query } = require('../models/database');
const { 
  generateToken, 
  createSession, 
  revokeSession, 
  revokeAllUserSessions 
} = require('../middleware/auth');

// Rate limiting para login - Desabilitado para desenvolvimento
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo alto para desenvolvimento
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para registro - Desabilitado para desenvolvimento
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, // máximo alto para desenvolvimento
  message: {
    error: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    code: 'REGISTER_LIMIT_EXCEEDED'
  }
});

// Função para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para validar força da senha
const isStrongPassword = (password) => {
  // Pelo menos 8 caracteres com pelo menos 1 número
  const passwordRegex = /^(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Buscar usuário (por username ou email)
    const userResult = await query(
      `SELECT id, username, email, password_hash, full_name, is_active, 
              login_attempts, locked_until 
       FROM users 
       WHERE (LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)) AND is_active = true`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = userResult.rows[0];

    // Verificar se a conta está bloqueada
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const lockTime = new Date(user.locked_until).toLocaleString();
      return res.status(423).json({
        error: `Conta temporariamente bloqueada até ${lockTime}`,
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      // Incrementar tentativas de login
      const newAttempts = (user.login_attempts || 0) + 1;
      let lockUntil = null;

      // Bloquear após 5 tentativas por 30 minutos
      if (newAttempts >= 5) {
        lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
      }

      await query(
        'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
        [newAttempts, lockUntil, user.id]
      );

      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: lockUntil ? 0 : Math.max(0, 5 - newAttempts)
      });
    }

    // Login bem-sucedido - resetar tentativas
    await query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Gerar token
    const token = generateToken(user.id);
    
    // Criar sessão
    const sessionId = await createSession(user.id, token, ipAddress, userAgent);

    // Dados do usuário para resposta (sem senha)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      lastLogin: new Date().toISOString()
    };

    res.json({
      message: 'Login realizado com sucesso',
      user: userData,
      token,
      sessionId,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Registro
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validações
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email e senha são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        error: 'Username deve ter entre 3 e 50 caracteres',
        code: 'INVALID_USERNAME'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        code: 'INVALID_EMAIL'
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Senha deve ter pelo menos 8 caracteres incluindo pelo menos 1 número',
        code: 'WEAK_PASSWORD'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Username ou email já está em uso',
        code: 'USER_EXISTS'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const result = await query(
      `INSERT INTO users (username, email, password_hash, full_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, full_name, created_at`,
      [username, email, passwordHash, fullName || username]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const sessionId = req.session?.id;
    
    if (sessionId) {
      await revokeSession(sessionId);
    }

    res.json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Logout de todas as sessões
const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await revokeAllUserSessions(userId);

    res.json({
      message: 'Logout de todas as sessões realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout completo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Verificar status da sessão
const verifyToken = async (req, res) => {
  try {
    // Se chegou aqui, o middleware já validou o token
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.full_name,
        lastLogin: req.user.last_login
      }
    });

  } catch (error) {
    console.error('Erro na verificação de token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Alterar senha
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 8 caracteres incluindo pelo menos 1 número',
        code: 'WEAK_PASSWORD'
      });
    }

    // Buscar senha atual
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Verificar senha atual
    const currentPasswordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!currentPasswordMatch) {
      return res.status(400).json({
        error: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Revogar todas as outras sessões por segurança
    await revokeAllUserSessions(userId);

    res.json({
      message: 'Senha alterada com sucesso. Faça login novamente.'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  logoutAll,
  verifyToken,
  changePassword,
  loginLimiter,
  registerLimiter
};