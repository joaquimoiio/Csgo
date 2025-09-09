import { Link, useLocation } from 'react-router-dom';
import { DashboardIcon, SkinIcon, BoxIcon, InvestmentIcon, InventoryIcon } from './Icons';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon },
    { path: '/inventario', label: 'Inventário', icon: InventoryIcon },
    { path: '/skins', label: 'CS:GO Skins', icon: SkinIcon },
    { path: '/caixas', label: 'Caixas', icon: BoxIcon },
    { path: '/investimentos', label: 'Investimentos', icon: InvestmentIcon },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cs-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="text-white font-bold hidden sm:block">CS2 Earnings</span>
            </div>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-cs-orange text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;