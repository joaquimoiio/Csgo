const express = require('express');
const cors = require('cors');
const earningsRoutes = require('./src/routes/earnings');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/earnings', earningsRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'CS2 Earnings Tracker API funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}`);
});