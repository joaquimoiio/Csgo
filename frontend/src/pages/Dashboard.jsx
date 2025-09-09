import { useState } from 'react';
import EarningsSummary from '../components/EarningsSummary';
import EarningsChart from '../components/EarningsChart';
import ReminderCalendar from '../components/ReminderCalendar';
import { DashboardIcon } from '../components/Icons';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 px-0 sm:px-4 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-cs-orange rounded-lg flex items-center justify-center">
              <DashboardIcon className="w-8 h-8 text-white" />
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

        {/* Calendário de Lembretes */}
        <div className="mb-8">
          <ReminderCalendar />
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>🎮 Dashboard de controle para seus investimentos em CS:GO! 📈</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;