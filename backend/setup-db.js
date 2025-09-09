const { Client } = require('pg');
require('dotenv').config();

// Conexão para criar o banco (usando database padrão)
const createClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // database padrão para criar outros databases
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Conexão para usar o banco criado
const appClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cs2_earnings',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const setupDatabase = async () => {
  try {
    console.log('🔧 Iniciando configuração do banco PostgreSQL...');
    
    // Conectar ao PostgreSQL
    await createClient.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Verificar se o banco existe
    const dbName = process.env.DB_NAME || 'cs2_earnings';
    const dbExists = await createClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (dbExists.rows.length === 0) {
      // Criar banco se não existir
      await createClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Banco "${dbName}" criado com sucesso!`);
    } else {
      console.log(`✅ Banco "${dbName}" já existe`);
    }
    
    await createClient.end();
    
    // Conectar ao banco da aplicação e criar tabela
    await appClient.connect();
    console.log('✅ Conectado ao banco cs2_earnings');
    
    // Criar tabela earnings
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS earnings (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK(type IN ('csgoskins', 'caixas', 'investimentos')),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela "earnings" criada/verificada com sucesso!');
    
    // Inserir dados de exemplo
    const existingData = await appClient.query('SELECT COUNT(*) FROM earnings');
    const count = parseInt(existingData.rows[0].count);
    
    if (count === 0) {
      console.log('📝 Inserindo dados de exemplo...');
      
      const sampleData = [
        ['csgoskins', 150.50, 'Venda AK-47 Redline'],
        ['csgoskins', 320.80, 'AWP Dragon Lore'],
        ['caixas', 75.30, 'Abertura Caixa Spectrum'],
        ['investimentos', 200.00, 'Investimento mensal'],
      ];
      
      for (const [type, amount, description] of sampleData) {
        await appClient.query(
          'INSERT INTO earnings (type, amount, description) VALUES ($1, $2, $3)',
          [type, amount, description]
        );
      }
      console.log('✅ Dados de exemplo inseridos!');
    } else {
      console.log(`✅ Banco já possui ${count} registros`);
    }
    
    await appClient.end();
    
    console.log('🎯 Configuração do banco PostgreSQL concluída!');
    console.log('🚀 Agora você pode executar: npm run dev');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  }
};

// Executar configuração
setupDatabase();