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

// Função para criar a tabela se não existir
const createTable = async () => {
  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS earnings (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK(type IN ('csgoskins', 'caixas', 'investimentos')),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tabela "earnings" criada/verificada com sucesso!');
    client.release();
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
  }
};

// Inicializar tabela ao carregar o módulo
createTable();

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