import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { earningsService } from '../services/api';

const EarningsChart = ({ refresh }) => {
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

  const steamData = [
    { name: 'CS:GO Skins', value: totals.csgoskins?.steam || 0, color: '#10b981' },
    { name: 'Caixas', value: totals.caixas?.steam || 0, color: '#f59e0b' },
    { name: 'Inventory', value: totals.inventory?.steam || 0, color: '#8b5cf6' },
  ];

  const marketData = [
    { name: 'CS:GO Skins', value: totals.csgoskins?.market || 0, color: '#10b981' },
    { name: 'Caixas', value: totals.caixas?.market || 0, color: '#f59e0b' },
    { name: 'Inventory', value: totals.inventory?.market || 0, color: '#8b5cf6' },
  ];

  const steamTotal = steamData.reduce((sum, item) => sum + item.value, 0);
  const marketTotal = marketData.reduce((sum, item) => sum + item.value, 0);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-cs-orange font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (steamTotal === 0 && marketTotal === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-cs-orange">Gráficos de Valores</h3>
        <div className="h-64 flex items-center justify-center text-slate-400">
          <p>Nenhum valor registrado ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-cs-orange">Gráficos de Valores</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Steam */}
        <div>
          <h4 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
            <span className="text-blue-400">💨</span>
            Valores Steam
            <span className="text-sm text-slate-400">
              (R$ {new Intl.NumberFormat('pt-BR').format(steamTotal)})
            </span>
          </h4>
          {steamTotal > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={steamData.filter(item => item.value > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  stroke="#64748b"
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 border border-slate-600 rounded">
              <p>Nenhum valor Steam registrado</p>
            </div>
          )}
        </div>

        {/* Gráfico Mercado */}
        <div>
          <h4 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
            <span className="text-green-400">🏪</span>
            Valores Mercado
            <span className="text-sm text-slate-400">
              (R$ {new Intl.NumberFormat('pt-BR').format(marketTotal)})
            </span>
          </h4>
          {marketTotal > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={marketData.filter(item => item.value > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  stroke="#64748b"
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 border border-slate-600 rounded">
              <p>Nenhum valor Mercado registrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Total */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700/50 p-4 rounded-lg border border-blue-500/30">
          <div className="text-center">
            <div className="text-blue-400 text-2xl mb-1">💨</div>
            <div className="text-white font-medium">Steam Total</div>
            <div className="text-blue-400 text-xl font-bold">
              R$ {new Intl.NumberFormat('pt-BR').format(steamTotal)}
            </div>
          </div>
        </div>
        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
          <div className="text-center">
            <div className="text-green-400 text-2xl mb-1">🏪</div>
            <div className="text-white font-medium">Mercado Total</div>
            <div className="text-green-400 text-xl font-bold">
              R$ {new Intl.NumberFormat('pt-BR').format(marketTotal)}
            </div>
          </div>
        </div>
        <div className="bg-slate-700/50 p-4 rounded-lg border border-cs-orange/30">
          <div className="text-center">
            <div className="text-cs-orange text-2xl mb-1">💰</div>
            <div className="text-white font-medium">Total Geral</div>
            <div className="text-cs-orange text-xl font-bold">
              R$ {new Intl.NumberFormat('pt-BR').format(steamTotal + marketTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;