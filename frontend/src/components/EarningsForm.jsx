import { useState } from 'react';
import { earningsService } from '../services/api';

const EarningsForm = ({ onEarningAdded, defaultType = 'csgoskins' }) => {
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    setLoading(true);
    try {
      await earningsService.add({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      setFormData({
        type: defaultType,
        amount: '',
        description: ''
      });
      
      if (onEarningAdded) onEarningAdded();
    } catch (error) {
      console.error('Erro ao adicionar ganho:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-cs-orange">Adicionar Ganho</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-cs-orange"
          >
            <option value="csgoskins">CS:GO Skins</option>
            <option value="caixas">Caixas do CS</option>
            <option value="investimentos">Investimentos Externos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Valor (R$)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-cs-orange"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-cs-orange"
            placeholder="Descrição do ganho..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cs-orange hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adicionando...' : 'Adicionar Ganho'}
        </button>
      </form>
    </div>
  );
};

export default EarningsForm;