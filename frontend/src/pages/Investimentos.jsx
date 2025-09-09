import { useState, useEffect } from 'react';
import { earningsService } from '../services/api';
import EarningsForm from '../components/EarningsForm';

const Investimentos = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadEarnings = async () => {
    try {
      const response = await earningsService.getByType('investimentos');
      setEarnings(response.data);
      const totalAmount = response.data.reduce((sum, earning) => sum + earning.amount, 0);
      setTotal(totalAmount);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este investimento?')) return;
    
    try {
      await earningsService.delete(id);
      loadEarnings();
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
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

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Investimentos Externos</h1>
              <p className="text-slate-400">Dinheiro investido de fontes externas</p>
            </div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-medium">Total de Investimentos:</span>
              <span className="text-blue-400 font-bold text-xl">{formatCurrency(total)}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Adicionar Investimento</h3>
              <EarningsForm 
                onEarningAdded={loadEarnings}
                defaultType="investimentos"
              />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Histórico de Investimentos</h3>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded"></div>
                ))}
              </div>
            ) : earnings.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum investimento registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-blue-400 font-bold">
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
                      title="Deletar investimento"
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
        </div>
      </div>
    </div>
  );
};

export default Investimentos;