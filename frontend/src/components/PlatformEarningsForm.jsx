import { useState } from 'react';
import { earningsService } from '../services/api';
import { SteamIcon, MarketIcon } from './Icons';

const PlatformEarningsForm = ({ onEarningAdded, defaultType = 'csgoskins' }) => {
  const [formData, setFormData] = useState({
    type: defaultType,
    name: '',
    amount: '',
    originalPrice: '', // preço original do item
    soldPrice: '', // preço de venda
    steamPrice: '', // preço na Steam (obrigatório)
    marketPrice: '', // preço no mercado online (obrigatório)
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.name || !formData.steamPrice || !formData.marketPrice) return;

    setLoading(true);
    try {
      const earningData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        soldPrice: parseFloat(formData.soldPrice) || 0,
        steamPrice: parseFloat(formData.steamPrice) || 0,
        marketPrice: parseFloat(formData.marketPrice) || 0,
        // Tipo padrão sem prefixo de plataforma
        type: defaultType
      };

      await earningsService.add(earningData);
      
      setFormData({
        type: defaultType,
        name: '',
        amount: '',
        originalPrice: '',
        soldPrice: '',
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
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-calcular ganho quando preços são inseridos
    if (name === 'soldPrice' || name === 'originalPrice') {
      const soldPrice = parseFloat(name === 'soldPrice' ? value : formData.soldPrice) || 0;
      const originalPrice = parseFloat(name === 'originalPrice' ? value : formData.originalPrice) || 0;
      
      if (soldPrice > 0 && originalPrice > 0) {
        newFormData.amount = (soldPrice - originalPrice).toString();
      }
    }

    setFormData(newFormData);
  };

  const getTypeColor = () => {
    const colors = {
      'csgoskins': 'green',
      'caixas': 'yellow',
      'investimentos': 'blue'
    };
    return colors[defaultType] || 'green';
  };

  const getTypeName = () => {
    const names = {
      'csgoskins': 'Skin',
      'caixas': 'Item de Caixa',
      'investimentos': 'Investimento'
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Preço Original (R$)</label>
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-gray-500 text-white"
            placeholder="Preço pago"
          />
        </div>
        
        <div>
          <label className="block text-slate-300 mb-2">Preço de Venda (R$)</label>
          <input
            type="number"
            name="soldPrice"
            value={formData.soldPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-green-500 text-white"
            placeholder="Preço que vendeu o item"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 mb-2">
          Lucro Obtido (R$)
          {formData.soldPrice && formData.originalPrice && (
            <span className="text-sm text-slate-400 ml-2">(Calculado automaticamente)</span>
          )}
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-${baseColor}-500 text-white`}
          placeholder="Lucro da transação"
          required
        />
      </div>

      {/* Preços atuais obrigatórios */}
      <div className="border-t border-slate-600 pt-4">
        <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
          💰 Preços Atuais (Obrigatório)
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
              placeholder="Preço atual na Steam"
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
              placeholder="Preço atual no mercado"
              required
            />
          </div>
        </div>
        
        <p className="text-xs text-slate-400 mt-2">
          * Informe os preços atuais do item em ambas as plataformas para comparação
        </p>
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Observações</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-green-500 text-white"
          placeholder="Detalhes da transação..."
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-${baseColor}-500 hover:bg-${baseColor}-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Registrando...' : `Registrar ${getTypeName()}`}
      </button>
    </form>
  );
};

export default PlatformEarningsForm;