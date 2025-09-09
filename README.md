# CS2 Earnings Tracker 🎯💰

Sistema para administrar ganhos no CS2 para juntar dinheiro e comprar faca e luva.

## 📋 Funcionalidades

- **3 Áreas de Ganhos Separadas:**
  - 🎯 CS:GO Skins (venda de skins)
  - 📦 Caixas do CS (retornos de caixas)
  - 💰 Investimentos Externos (dinheiro de fora)

- **Dashboard Completo:**
  - ✅ Lucro total consolidado
  - 📊 Gráficos interativos (barras e pizza)
  - 📈 Resumo por categoria
  - 📝 Histórico de ganhos

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- PostgreSQL instalado e rodando
- Banco PostgreSQL configurado (usuário: postgres, senha: postgres)

### Backend (Node.js + Express + PostgreSQL)

```bash
cd backend
npm install

# Configurar banco PostgreSQL (criar database e tabelas)
npm run setup-db

# Executar servidor
npm run dev
```

O backend rodará em: `http://localhost:3001`

**Configuração do PostgreSQL:**
- Host: localhost:5432
- Database: cs2_earnings
- User: postgres / Password: postgres
- Para alterar, edite o arquivo `.env`

### Frontend (React + Vite + TailwindCSS)

```bash
cd frontend
npm install
npm run dev
```

O frontend rodará em: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
/project-root
  /backend
    /src
      /routes      - Rotas da API REST
      /models      - Modelos do banco PostgreSQL
      /controllers - Lógica de negócio
    server.js      - Servidor principal
  /frontend
    /src
      /components  - Componentes React
      /pages       - Páginas da aplicação
      /services    - Serviços de API
```

## 🛠 Tecnologias Utilizadas

**Backend:**
- Node.js + Express
- PostgreSQL (pg)
- CORS
- Nodemon
- dotenv

**Frontend:**
- React 19
- Vite
- TailwindCSS
- Recharts (gráficos)
- Axios (HTTP client)
- React Router

## 📊 API Endpoints

### Ganhos
- `GET /api/earnings` - Listar todos os ganhos
- `GET /api/earnings/type/:type` - Ganhos por tipo
- `GET /api/earnings/totals` - Totais por categoria
- `POST /api/earnings` - Adicionar ganho
- `DELETE /api/earnings/:id` - Deletar ganho

### Tipos de Ganho
- `csgoskins` - CS:GO Skins
- `caixas` - Caixas do CS
- `investimentos` - Investimentos Externos

## 🎮 Como Usar

1. Execute o backend e frontend
2. Acesse `http://localhost:5173`
3. Use o dashboard para:
   - Ver resumo total dos ganhos
   - Adicionar novos ganhos
   - Visualizar gráficos
   - Gerenciar histórico

## 🎯 Objetivo

Juntar dinheiro suficiente para comprar:
- 🔪 **Faca** dos sonhos
- 🧤 **Luva** desejada

Boa sorte, guerreiro! 💎