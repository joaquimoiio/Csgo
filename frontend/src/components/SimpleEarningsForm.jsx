import { useState } from 'react';
import { earningsService } from '../services/api';
import { SteamIcon, MarketIcon } from './Icons';

const SimpleEarningsForm = ({ onEarningAdded, defaultType = 'csgoskins' }) => {
  const [formData, setFormData] = useState({
    type: defaultType,
    name: '',
    steamPrice: '', // preço na Steam (obrigatório)
    marketPrice: '', // preço no mercado online (obrigatório)
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.steamPrice || !formData.marketPrice) return;

    setLoading(true);
    try {
      const itemData = {
        ...formData,
        steamPrice: parseFloat(formData.steamPrice) || 0,
        marketPrice: parseFloat(formData.marketPrice) || 0,
        type: defaultType
      };

      await earningsService.add(itemData);
      
      setFormData({
        type: defaultType,
        name: '',
        steamPrice: '',
        marketPrice: '',
        description: ''
      });
      
      if (onEarningAdded) onEarningAdded();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
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
      'csgoskins': 'green',
      'caixas': 'yellow',
      'investimentos': 'blue',
      'despesas': 'red'
    };
    return colors[defaultType] || 'green';
  };

  const getTypeName = () => {
    const names = {
      'csgoskins': 'Skin',
      'caixas': 'Caixa/Item',
      'investimentos': 'Investimento',
      'despesas': 'Despesa'
    };
    return names[defaultType] || 'Item';
  };

  const baseColor = getTypeColor();

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

      {/* Preços obrigatórios */}
      <div>
        <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
          💰 Preços de Mercado (Obrigatório)
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2 flex items-center gap-2">
              <SteamIcon className="w-4 h-4 text-blue-400" />
              Preço Steam (R$) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="steamPrice"
              value={formData.steamPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-slate-700 border border-blue-500/50 rounded-md focus:outline-none focus:border-blue-500 text-white"
              placeholder="Preço na Steam"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 mb-2 flex items-center gap-2">
              <MarketIcon className="w-4 h-4 text-orange-400" />
              Preço Mercado (R$) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="marketPrice"
              value={formData.marketPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-slate-700 border border-orange-500/50 rounded-md focus:outline-none focus:border-orange-500 text-white"
              placeholder="Preço no mercado"
              required
            />
          </div>
        </div>
        
        <p className="text-xs text-slate-400 mt-2">
          * Ambos os preços são obrigatórios para comparação
        </p>
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
        className={`w-full bg-${baseColor}-500 hover:bg-${baseColor}-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Adicionando...' : `Adicionar ${getTypeName()}`}
      </button>
    </form>
  );
};

export default SimpleEarningsForm;