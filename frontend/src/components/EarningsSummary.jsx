import { useEffect, useState } from 'react';
import { earningsService } from '../services/api';
import { SteamIcon, MarketIcon } from './Icons';

const EarningsSummary = ({ refresh }) => {
  const [totals, setTotals] = useState({
    csgoskins: 0,
    csgoskins_steam: 0,
    csgoskins_market: 0,
    caixas: 0,
    caixas_steam: 0,
    caixas_market: 0,
    investimentos: 0,
    total: 0,
    totalSteam: 0,
    totalMarket: 0
  });
  const [loading, setLoading] = useState(true);

  const loadTotals = async () => {
    try {
      // Carregar dados simplificados
      const [
        totalsResponse,
        skinsResponse,
        caixasResponse,
        investimentosResponse
      ] = await Promise.all([
        earningsService.getTotals(),
        earningsService.getByType('csgoskins'),
        earningsService.getByType('caixas'),
        earningsService.getByType('investimentos')
      ]);

      const oldTotals = totalsResponse.data || {};
      const skinsData = skinsResponse.data.data || [];
      const caixasData = caixasResponse.data.data || [];
      const investimentosData = investimentosResponse.data.data || [];
      
      // Calcular totais
      const skinsTotal = skinsData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const caixasTotal = caixasData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const investimentosTotal = investimentosData.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Calcular valores Steam e Mercado
      const skinsSteamTotal = skinsData.reduce((sum, item) => sum + (item.steamPrice || 0), 0);
      const skinsMarketTotal = skinsData.reduce((sum, item) => sum + (item.marketPrice || 0), 0);
      const caixasSteamTotal = caixasData.reduce((sum, item) => sum + (item.steamPrice || 0), 0);
      const caixasMarketTotal = caixasData.reduce((sum, item) => sum + (item.marketPrice || 0), 0);
      
      const totalSteam = skinsSteamTotal + caixasSteamTotal;
      const totalMarket = skinsMarketTotal + caixasMarketTotal;
      const totalGeral = skinsTotal + caixasTotal + investimentosTotal;

      setTotals({
        csgoskins: skinsTotal,
        csgoskins_steam: skinsSteamTotal,
        csgoskins_market: skinsMarketTotal,
        caixas: caixasTotal,
        caixas_steam: caixasSteamTotal,
        caixas_market: caixasMarketTotal,
        investimentos: investimentosTotal,
        total: totalGeral,
        totalSteam: totalSteam,
        totalMarket: totalMarket
      });
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
      
      <div className="space-y-4">
        {/* Totais por Plataforma */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <SteamIcon className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Steam</span>
            </div>
            <span className="text-white font-bold text-lg">{formatCurrency(totals.totalSteam)}</span>
          </div>
          
          <div className="bg-orange-500/20 border border-orange-500/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MarketIcon className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium text-sm">Mercado</span>
            </div>
            <span className="text-white font-bold text-lg">{formatCurrency(totals.totalMarket)}</span>
          </div>
        </div>

        {/* Totais por Categoria */}
        <div className="space-y-2">
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-medium">CS:GO Skins</span>
              <span className="text-white font-bold">{formatCurrency(totals.csgoskins)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-blue-400">
                <SteamIcon className="w-3 h-3" />
                {formatCurrency(totals.csgoskins_steam)}
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <MarketIcon className="w-3 h-3" />
                {formatCurrency(totals.csgoskins_market)}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-medium">Caixas do CS</span>
              <span className="text-white font-bold">{formatCurrency(totals.caixas)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-blue-400">
                <SteamIcon className="w-3 h-3" />
                {formatCurrency(totals.caixas_steam)}
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <MarketIcon className="w-3 h-3" />
                {formatCurrency(totals.caixas_market)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
            <span className="text-blue-400 font-medium">Investimentos</span>
            <span className="text-white font-bold">{formatCurrency(totals.investimentos)}</span>
          </div>
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