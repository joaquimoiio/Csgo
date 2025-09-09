import { useEffect, useState } from 'react';
import { earningsService } from '../services/api';

const EarningsList = ({ refresh, onDelete }) => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadEarnings = async () => {
    try {
      const response = await earningsService.getAll();
      setEarnings(response.data);
    } catch (error) {
      console.error('Erro ao carregar ganhos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este ganho?')) return;
    
    try {
      await earningsService.delete(id);
      await loadEarnings();
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Erro ao deletar ganho:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const types = {
      csgoskins: 'CS:GO Skins',
      caixas: 'Caixas do CS',
      investimentos: 'Investimentos'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      csgoskins: 'bg-green-500/20 text-green-400 border-green-500/30',
      caixas: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      investimentos: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const filteredEarnings = filter === 'all' 
    ? earnings 
    : earnings.filter(earning => earning.type === filter);

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-cs-orange">Histórico de Ganhos</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:outline-none focus:border-cs-orange"
        >
          <option value="all">Todos</option>
          <option value="csgoskins">CS:GO Skins</option>
          <option value="caixas">Caixas</option>
          <option value="investimentos">Investimentos</option>
        </select>
      </div>

      {filteredEarnings.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>Nenhum ganho encontrado</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEarnings.map((earning) => (
            <div
              key={earning.id}
              className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(earning.type)}`}>
                    {getTypeLabel(earning.type)}
                  </span>
                  <span className="text-white font-bold">
                    {formatCurrency(earning.amount)}
                  </span>
                </div>
                {earning.description && (
                  <p className="text-slate-300 text-sm mb-1">{earning.description}</p>
                )}
                <p className="text-slate-400 text-xs">{formatDate(earning.date)}</p>
              </div>
              <button
                onClick={() => handleDelete(earning.id)}
                className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"
                title="Deletar ganho"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EarningsList;