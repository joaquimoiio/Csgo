import { useState } from 'react';
import EarningsSummary from '../components/EarningsSummary';
import EarningsChart from '../components/EarningsChart';
import EarningsForm from '../components/EarningsForm';
import EarningsList from '../components/EarningsList';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-cs-orange rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CS2 Earnings Tracker</h1>
              <p className="text-slate-400">Administre seus ganhos para comprar faca e luva</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <EarningsSummary refresh={refreshKey} />
          </div>
          <div className="lg:col-span-2">
            <EarningsChart refresh={refreshKey} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <EarningsForm onEarningAdded={handleDataChange} />
          </div>
          <div>
            <EarningsList refresh={refreshKey} onDelete={handleDataChange} />
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>🔫 Juntando dinheiro para comprar aquela faca e luva dos sonhos! 💎</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;