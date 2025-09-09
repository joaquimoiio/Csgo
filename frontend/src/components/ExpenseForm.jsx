import { useState } from 'react';
import { earningsService } from '../services/api';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '', // preço fixo da despesa
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    setLoading(true);
    try {
      const expenseData = {
        type: 'despesas',
        name: formData.name,
        amount: parseFloat(formData.amount) || 0,
        description: formData.description
      };

      await earningsService.add(expenseData);
      
      setFormData({
        name: '',
        amount: '',
        description: ''
      });
      
      if (onExpenseAdded) onExpenseAdded();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-slate-300 mb-2">Nome da Despesa</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-red-500 text-white"
          placeholder="Ex: Steam, chave, caso, etc."
          required
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Valor (R$) <span className="text-red-400">*</span></label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          className="w-full px-3 py-2 bg-slate-700 border border-red-500/50 rounded-md focus:outline-none focus:border-red-500 text-white"
          placeholder="Valor da despesa"
          required
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Observações</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:border-red-500 text-white"
          placeholder="Detalhes da despesa..."
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adicionando...' : 'Adicionar Despesa'}
      </button>
    </form>
  );
};

export default ExpenseForm;