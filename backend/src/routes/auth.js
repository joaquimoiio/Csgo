const express = require('express');
const helmet = require('helmet');
const { 
  login, 
  register, 
  logout, 
  logoutAll, 
  verifyToken, 
  changePassword,
  loginLimiter,
  registerLimiter
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar helmet para segurança adicional
router.use(helmet());

// Rotas públicas (não requerem autenticação)
router.post('/login', loginLimiter, login);
router.post('/register', registerLimiter, register);

// Rotas protegidas (requerem autenticação)
router.use(authenticateToken); // Todas as rotas abaixo precisam de autenticação

router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/verify', verifyToken);
router.put('/change-password', changePassword);

// Rota para obter perfil do usuário
router.get('/profile', (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.full_name,
      lastLogin: req.user.last_login,
      isActive: req.user.is_active
    }
  });
});

// Rota para atualizar perfil
router.put('/profile', async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.id;
    const { query } = require('../models/database');

    // Validar email se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Email inválido',
          code: 'INVALID_EMAIL'
        });
      }

      // Verificar se email já está em uso por outro usuário
      const emailCheck = await query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          error: 'Email já está em uso',
          code: 'EMAIL_IN_USE'
        });
      }
    }

    // Atualizar dados
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(fullName);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar',
        code: 'NO_UPDATES'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, username, email, full_name, updated_at`,
      values
    );

    const updatedUser = result.rows[0];

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Rota para listar sessões ativas
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = require('../models/database');

    const sessions = await query(
      `SELECT id, created_at, expires_at, ip_address, user_agent, 
              CASE WHEN id = $2 THEN true ELSE false END as is_current
       FROM user_sessions 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId, req.session?.id]
    );

    res.json({
      sessions: sessions.rows.map(session => ({
        id: session.id,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        isCurrent: session.is_current
      }))
    });

  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Rota para revogar uma sessão específica
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { query } = require('../models/database');

    // Verificar se a sessão pertence ao usuário
    const sessionCheck = await query(
      'SELECT id FROM user_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Revogar a sessão
    await query('DELETE FROM user_sessions WHERE id = $1', [sessionId]);

    res.json({
      message: 'Sessão revogada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;