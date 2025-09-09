import { useEffect, useState } from 'react';
import { earningsService } from '../services/api';

const EarningsSummary = ({ refresh }) => {
  const [totals, setTotals] = useState({
    csgoskins: 0,
    caixas: 0,
    investimentos: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  const loadTotals = async () => {
    try {
      const response = await earningsService.getTotals();
      setTotals(response.data);
    } catch (error) {
      console.error('Erro ao carregar totais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotals();
  }, [refresh]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-cs-orange">Resumo dos Ganhos</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
          <span className="text-green-400 font-medium">CS:GO Skins</span>
          <span className="text-white font-bold">{formatCurrency(totals.csgoskins)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
          <span className="text-yellow-400 font-medium">Caixas do CS</span>
          <span className="text-white font-bold">{formatCurrency(totals.caixas)}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
          <span className="text-blue-400 font-medium">Investimentos</span>
          <span className="text-white font-bold">{formatCurrency(totals.investimentos)}</span>
        </div>
        
        <div className="border-t border-slate-600 pt-3">
          <div className="flex justify-between items-center p-4 bg-cs-orange/20 border border-cs-orange rounded-lg">
            <span className="text-cs-orange font-bold text-lg">TOTAL GERAL</span>
            <span className="text-cs-orange font-bold text-xl">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsSummary;