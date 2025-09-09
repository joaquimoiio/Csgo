const db = require('../models/database');

class EarningsController {
  // Adicionar novo ganho
  static async addEarning(req, res) {
    const { type, amount, description } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Tipo e valor são obrigatórios' });
    }

    const validTypes = ['csgoskins', 'caixas', 'investimentos'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    try {
      const query = 'INSERT INTO earnings (type, amount, description) VALUES ($1, $2, $3) RETURNING *';
      const values = [type, amount, description || null];
      
      const result = await db.query(query, values);
      const newEarning = result.rows[0];
      
      res.json({ 
        id: newEarning.id, 
        type: newEarning.type, 
        amount: parseFloat(newEarning.amount), 
        description: newEarning.description,
        message: 'Ganho adicionado com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao adicionar ganho:', error);
      res.status(500).json({ error: 'Erro ao adicionar ganho' });
    }
  }

  // Listar todos os ganhos
  static async getAllEarnings(req, res) {
    try {
      const query = 'SELECT * FROM earnings ORDER BY date DESC';
      const result = await db.query(query);
      
      const earnings = result.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount)
      }));
      
      res.json(earnings);
    } catch (error) {
      console.error('Erro ao buscar ganhos:', error);
      res.status(500).json({ error: 'Erro ao buscar ganhos' });
    }
  }

  // Listar ganhos por tipo
  static async getEarningsByType(req, res) {
    const { type } = req.params;
    
    try {
      const query = 'SELECT * FROM earnings WHERE type = $1 ORDER BY date DESC';
      const result = await db.query(query, [type]);
      
      const earnings = result.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount)
      }));
      
      res.json(earnings);
    } catch (error) {
      console.error('Erro ao buscar ganhos por tipo:', error);
      res.status(500).json({ error: 'Erro ao buscar ganhos por tipo' });
    }
  }

  // Calcular total por categoria e geral
  static async getTotals(req, res) {
    try {
      const query = `
        SELECT 
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM earnings 
        GROUP BY type
      `;
      
      const result = await db.query(query);
      
      const totals = {
        csgoskins: 0,
        caixas: 0,
        investimentos: 0,
        total: 0
      };
      
      result.rows.forEach(row => {
        const total = parseFloat(row.total) || 0;
        totals[row.type] = total;
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
    
    try {
      const query = 'DELETE FROM earnings WHERE id = $1';
      const result = await db.query(query, [id]);
      
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