const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cs2_earnings',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para criar e migrar todas as tabelas
const createTables = async () => {
  try {
    const client = await pool.connect();
    
    // 1. Criar tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE
      )
    `);

    // Criar índice único para email (case-insensitive)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_email_lower 
      ON users (LOWER(email))
    `);
    
    // Criar índice único para username (case-insensitive)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_username_lower 
      ON users (LOWER(username))
    `);
    console.log('Tabela "users" criada/verificada com sucesso!');

    // 2. Criar tabela de sessões (para controle de tokens)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
      )
    `);
    console.log('Tabela "user_sessions" criada/verificada com sucesso!');

    // 3. Criar tabela de tarefas do calendário
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_type VARCHAR(20) NOT NULL CHECK(task_type IN ('daily', 'weekly')),
        task_date DATE NOT NULL,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, task_type, task_date)
      )
    `);
    console.log('Tabela "user_tasks" criada/verificada com sucesso!');

    // 4. Verificar se a tabela earnings tem user_id
    const checkEarningsColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'earnings' AND table_schema = 'public'
    `);
    
    const earningsColumnNames = checkEarningsColumns.rows.map(row => row.column_name);

    // 5. Criar/migrar tabela earnings melhorada
    await client.query(`
      CREATE TABLE IF NOT EXISTS earnings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK(type IN ('csgoskins', 'caixas', 'investimentos', 'despesas', 'inventory')),
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2),
        steam_price DECIMAL(10,2),
        market_price DECIMAL(10,2),
        description TEXT,
        category VARCHAR(100),
        condition VARCHAR(50),
        platform VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Adicionar colunas que não existem na tabela earnings
    if (!earningsColumnNames.includes('user_id')) {
      await client.query('ALTER TABLE earnings ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
      console.log('Coluna "user_id" adicionada à tabela earnings');
    }
    
    if (!earningsColumnNames.includes('name')) {
      await client.query('ALTER TABLE earnings ADD COLUMN name VARCHAR(255)');
      console.log('Coluna "name" adicionada');
    }
    
    if (!earningsColumnNames.includes('steam_price')) {
      await client.query('ALTER TABLE earnings ADD COLUMN steam_price DECIMAL(10,2)');
      console.log('Coluna "steam_price" adicionada');
    }
    
    if (!earningsColumnNames.includes('market_price')) {
      await client.query('ALTER TABLE earnings ADD COLUMN market_price DECIMAL(10,2)');
      console.log('Coluna "market_price" adicionada');
    }

    if (!earningsColumnNames.includes('category')) {
      await client.query('ALTER TABLE earnings ADD COLUMN category VARCHAR(100)');
      console.log('Coluna "category" adicionada');
    }

    if (!earningsColumnNames.includes('condition')) {
      await client.query('ALTER TABLE earnings ADD COLUMN condition VARCHAR(50)');
      console.log('Coluna "condition" adicionada');
    }

    if (!earningsColumnNames.includes('platform')) {
      await client.query('ALTER TABLE earnings ADD COLUMN platform VARCHAR(100)');
      console.log('Coluna "platform" adicionada');
    }

    if (!earningsColumnNames.includes('created_at')) {
      await client.query('ALTER TABLE earnings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
      console.log('Coluna "created_at" adicionada');
    }

    if (!earningsColumnNames.includes('updated_at')) {
      await client.query('ALTER TABLE earnings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
      console.log('Coluna "updated_at" adicionada');
    }

    // 6. Atualizar constraint de tipos
    try {
      await client.query(`
        ALTER TABLE earnings DROP CONSTRAINT IF EXISTS earnings_type_check
      `);
      await client.query(`
        ALTER TABLE earnings ADD CONSTRAINT earnings_type_check 
        CHECK (type IN ('csgoskins', 'caixas', 'investimentos', 'despesas', 'inventory'))
      `);
      console.log('Constraint de tipos atualizada');
    } catch (err) {
      console.log('Aviso: Erro ao atualizar constraint (pode ser normal se já existir)');
    }

    // 6. Permitir amount ser nullable
    try {
      await client.query('ALTER TABLE earnings ALTER COLUMN amount DROP NOT NULL');
      console.log('Campo "amount" agora permite NULL');
    } catch (err) {
      console.log('Aviso: Campo amount já permite NULL ou erro esperado');
    }

    // 7. Criar índices para performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON earnings(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_earnings_type ON earnings(type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_earnings_date ON earnings(date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)');
    console.log('Índices criados para melhor performance');

    // Usuário padrão removido - use o registro para criar novos usuários

    console.log('Todas as tabelas criadas/migradas com sucesso!');
    client.release();
  } catch (err) {
    console.error('Erro ao criar/migrar tabelas:', err);
  }
};

// Inicializar tabelas ao carregar o módulo
createTables();

// Event listeners para debugging
pool.on('connect', () => {
  console.log('Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro no pool PostgreSQL:', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params)
};