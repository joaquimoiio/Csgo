import { useState } from 'react';
import { earningsService } from '../services/api';
import { SteamIcon, MarketIcon } from './Icons';

const EnhancedEarningsForm = ({ onEarningAdded, defaultType = 'csgoskins' }) => {
  const [formData, setFormData] = useState({
    type: defaultType,
    name: '',
    amount: '',
    steamPrice: '',
    marketPrice: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount && !formData.steamPrice && !formData.marketPrice) return;

    setLoading(true);
    try {
      await earningsService.add({
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        steamPrice: parseFloat(formData.steamPrice) || 0,
        marketPrice: parseFloat(formData.marketPrice) || 0
      });
      
      setFormData({
        type: defaultType,
        name: '',
        amount: '',
        steamPrice: '',
        marketPrice: '',
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

  const getTypeColor = () => {
    const colors = {
      'csgoskins': 'text-green-400',
      'caixas': 'text-yellow-400',
      'investimentos': 'text-blue-400'
    };
    return colors[defaultType] || colors.csgoskins;
  };

  const getTypeName = () => {
    const names = {
      'csgoskins': 'Skin',
      'caixas': 'Caixa',
      'investimentos': 'Investimento'
    };
    return names[defaultType] || names.csgoskins;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-slate-300 mb-2">Nome do Item</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-green-500 text-white"
          placeholder={`Nome da ${getTypeName().toLowerCase()}`}
          required
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Ganho Obtido (R$)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-green-500 text-white`}
          placeholder="Valor ganho com venda"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 flex items-center gap-2">
            <SteamIcon className="w-4 h-4 text-blue-400" />
            Valor Steam (R$)
          </label>
          <input
            type="number"
            name="steamPrice"
            value={formData.steamPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-blue-500 text-white"
            placeholder="Preço na Steam"
          />
        </div>
        
        <div>
          <label className="block text-slate-300 mb-2 flex items-center gap-2">
            <MarketIcon className="w-4 h-4 text-orange-400" />
            Valor Mercado (R$)
          </label>
          <input
            type="number"
            name="marketPrice"
            value={formData.marketPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-orange-500 text-white"
            placeholder="Preço no mercado"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Observações</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-green-500 text-white"
          placeholder="Informações adicionais..."
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${getTypeColor().replace('text-', 'bg-').replace('-400', '-500')} hover:bg-opacity-80 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Adicionando...' : `Adicionar ${getTypeName()}`}
      </button>
    </form>
  );
};

export default EnhancedEarningsForm;