const db = require('../models/database');

class EarningsController {
  // Adicionar novo ganho
  static async addEarning(req, res) {
    const { type, name, amount, steamPrice, marketPrice, description, category, condition, platform } = req.body;
    const userId = req.user.id; // Vem do middleware de autenticação
    
    // Validação de campos obrigatórios baseada no tipo
    if (!type || !name) {
      return res.status(400).json({ error: 'Tipo e nome são obrigatórios' });
    }

    const validTypes = ['csgoskins', 'caixas', 'investimentos', 'despesas', 'inventory'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    // Para itens que precisam de preços Steam/Market (skins, caixas e inventory)
    if ((type === 'csgoskins' || type === 'caixas' || type === 'inventory') && (!steamPrice || !marketPrice)) {
      return res.status(400).json({ error: 'Preços da Steam e do mercado são obrigatórios para este tipo' });
    }

    // Para despesas e investimentos, apenas amount é necessário
    if ((type === 'despesas' || type === 'investimentos') && !amount) {
      return res.status(400).json({ error: 'Valor é obrigatório para este tipo' });
    }

    try {
      const query = `
        INSERT INTO earnings (user_id, type, name, amount, steam_price, market_price, description, category, condition, platform) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
      `;
      const values = [
        userId,
        type, 
        name,
        amount || null, 
        steamPrice || null, 
        marketPrice || null, 
        description || null,
        category || null,
        condition || null,
        platform || null
      ];
      
      const result = await db.query(query, values);
      const newEarning = result.rows[0];
      
      res.json({ 
        id: newEarning.id, 
        type: newEarning.type, 
        name: newEarning.name,
        amount: newEarning.amount ? parseFloat(newEarning.amount) : null, 
        steamPrice: newEarning.steam_price ? parseFloat(newEarning.steam_price) : null,
        marketPrice: newEarning.market_price ? parseFloat(newEarning.market_price) : null,
        description: newEarning.description,
        category: newEarning.category,
        condition: newEarning.condition,
        platform: newEarning.platform,
        date: newEarning.date,
        createdAt: newEarning.created_at,
        updatedAt: newEarning.updated_at,
        message: 'Item adicionado com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      res.status(500).json({ error: 'Erro ao adicionar item' });
    }
  }

  // Listar todos os ganhos
  static async getAllEarnings(req, res) {
    const userId = req.user.id;
    
    try {
      const query = 'SELECT * FROM earnings WHERE user_id = $1 ORDER BY date DESC';
      const result = await db.query(query, [userId]);
      
      const earnings = result.rows.map(row => ({
        id: row.id,
        type: row.type,
        name: row.name,
        amount: row.amount ? parseFloat(row.amount) : null,
        steamPrice: row.steam_price ? parseFloat(row.steam_price) : null,
        marketPrice: row.market_price ? parseFloat(row.market_price) : null,
        description: row.description,
        category: row.category,
        condition: row.condition,
        platform: row.platform,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      res.json({ data: earnings });
    } catch (error) {
      console.error('Erro ao buscar ganhos:', error);
      res.status(500).json({ error: 'Erro ao buscar ganhos' });
    }
  }

  // Listar ganhos por tipo
  static async getEarningsByType(req, res) {
    const { type } = req.params;
    const userId = req.user.id;
    
    try {
      const query = 'SELECT * FROM earnings WHERE user_id = $1 AND type = $2 ORDER BY date DESC';
      const result = await db.query(query, [userId, type]);
      
      const earnings = result.rows.map(row => ({
        id: row.id,
        type: row.type,
        name: row.name,
        amount: row.amount ? parseFloat(row.amount) : null,
        steamPrice: row.steam_price ? parseFloat(row.steam_price) : null,
        marketPrice: row.market_price ? parseFloat(row.market_price) : null,
        description: row.description,
        category: row.category,
        condition: row.condition,
        platform: row.platform,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      res.json({ data: earnings });
    } catch (error) {
      console.error('Erro ao buscar ganhos por tipo:', error);
      res.status(500).json({ error: 'Erro ao buscar ganhos por tipo' });
    }
  }

  // Calcular total por categoria e geral
  static async getTotals(req, res) {
    const userId = req.user.id;
    
    try {
      const query = `
        SELECT 
          type,
          SUM(
            CASE 
              WHEN type IN ('csgoskins', 'caixas', 'inventory') THEN COALESCE(steam_price, 0) + COALESCE(market_price, 0)
              ELSE COALESCE(amount, 0)
            END
          ) as total,
          COUNT(*) as count,
          SUM(COALESCE(steam_price, 0)) as steam_total,
          SUM(COALESCE(market_price, 0)) as market_total
        FROM earnings 
        WHERE user_id = $1
        GROUP BY type
      `;
      
      const result = await db.query(query, [userId]);
      
      const totals = {
        csgoskins: { total: 0, steam: 0, market: 0 },
        caixas: { total: 0, steam: 0, market: 0 },
        inventory: { total: 0, steam: 0, market: 0 },
        investimentos: { total: 0 },
        despesas: { total: 0 },
        total: 0
      };
      
      result.rows.forEach(row => {
        const total = parseFloat(row.total) || 0;
        const steamTotal = parseFloat(row.steam_total) || 0;
        const marketTotal = parseFloat(row.market_total) || 0;
        
        if (row.type === 'csgoskins' || row.type === 'caixas' || row.type === 'inventory') {
          totals[row.type] = {
            total: total,
            steam: steamTotal,
            market: marketTotal
          };
        } else {
          totals[row.type] = { total: total };
        }
        
        totals.total += total;
      });
      
      res.json(totals);
    } catch (error) {
      console.error('Erro ao calcular totais:', error);
      res.status(500).json({ error: 'Erro ao calcular totais' });
    }
  }

  // Deletar ganho
  static async deleteEarning(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
      // Verificar se o registro pertence ao usuário antes de deletar
      const checkQuery = 'SELECT id FROM earnings WHERE id = $1 AND user_id = $2';
      const checkResult = await db.query(checkQuery, [id, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Ganho não encontrado ou você não tem permissão para deletá-lo' });
      }
      
      const query = 'DELETE FROM earnings WHERE id = $1 AND user_id = $2';
      const result = await db.query(query, [id, userId]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Ganho não encontrado' });
      }
      
      res.json({ message: 'Ganho deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar ganho:', error);
      res.status(500).json({ error: 'Erro ao deletar ganho' });
    }
  }
}

module.exports = EarningsController;