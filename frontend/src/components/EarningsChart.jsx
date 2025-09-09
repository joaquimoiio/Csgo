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

  const barData = [
    { name: 'CS:GO Skins', value: totals.csgoskins, color: '#10b981' },
    { name: 'Caixas', value: totals.caixas, color: '#f59e0b' },
    { name: 'Investimentos', value: totals.investimentos, color: '#3b82f6' },
  ];

  const pieData = barData.filter(item => item.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];

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

  if (totals.total === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-cs-orange">Gráfico de Ganhos</h3>
        <div className="h-64 flex items-center justify-center text-slate-400">
          <p>Nenhum ganho registrado ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-cs-orange">Gráfico de Ganhos</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <div>
          <h4 className="text-lg font-medium mb-3 text-white">Ganhos por Categoria</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
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
              <Bar dataKey="value" fill="#FF6600" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza */}
        <div>
          <h4 className="text-lg font-medium mb-3 text-white">Distribuição (%)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value),
                  'Valor'
                ]}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;