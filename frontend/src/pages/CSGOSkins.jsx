import { useState, useEffect } from 'react';
import { earningsService } from '../services/api';
import SimpleEarningsForm from '../components/SimpleEarningsForm';
import { SkinIcon, SteamIcon, MarketIcon, DeleteIcon } from '../components/Icons';

const CSGOSkins = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [steamTotal, setSteamTotal] = useState(0);
  const [marketTotal, setMarketTotal] = useState(0);

  const loadEarnings = async () => {
    try {
      const response = await earningsService.getByType('csgoskins');
      const skinsData = response.data.data || []; // Acessar response.data.data devido à nova estrutura
      setEarnings(skinsData);
      
      const totalAmount = 0; // Sem campo de ganho no novo formato
      const steamTotalAmount = skinsData.reduce((sum, earning) => sum + (earning.steamPrice || 0), 0);
      const marketTotalAmount = skinsData.reduce((sum, earning) => sum + (earning.marketPrice || 0), 0);
      
      setTotal(totalAmount);
      setSteamTotal(steamTotalAmount);
      setMarketTotal(marketTotalAmount);
    } catch (error) {
      console.error('Erro ao carregar ganhos de skins:', error);
      setEarnings([]); // Garantir que earnings seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este ganho?')) return;
    
    try {
      await earningsService.delete(id);
      loadEarnings();
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

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <SkinIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CS:GO Skins</h1>
              <p className="text-slate-400">Ganhos com venda de skins</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SteamIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Valor Steam:</span>
                </div>
                <span className="text-blue-400 font-bold text-xl">{formatCurrency(steamTotal)}</span>
              </div>
            </div>
            
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MarketIcon className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">Valor Mercado:</span>
                </div>
                <span className="text-orange-400 font-bold text-xl">{formatCurrency(marketTotal)}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-green-400">Adicionar Skin</h3>
              <SimpleEarningsForm 
                onEarningAdded={loadEarnings}
                defaultType="csgoskins"
              />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-green-400">Histórico de Skins</h3>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded"></div>
                ))}
              </div>
            ) : earnings.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum ganho de skin registrado ainda</p>
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
                        {earning.name && (
                          <span className="text-white font-semibold">{earning.name}</span>
                        )}
                      </div>
                      
                      {/* Sempre mostrar preços Steam e Mercado */}
                      <div className="flex gap-4 text-sm mb-1">
                        <div className="flex items-center gap-1">
                          <SteamIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">{formatCurrency(earning.steamPrice || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MarketIcon className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400">{formatCurrency(earning.marketPrice || 0)}</span>
                        </div>
                      </div>
                      
                      {earning.description && (
                        <p className="text-slate-300 text-sm mb-1">{earning.description}</p>
                      )}
                      <p className="text-slate-400 text-xs">{formatDate(earning.date)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(earning.id)}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"
                      title="Deletar item"
                    >
                      <DeleteIcon />
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

export default CSGOSkins;