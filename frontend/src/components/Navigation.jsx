import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, SkinIcon, BoxIcon, InvestmentIcon, InventoryIcon, ExpenseIcon } from './Icons';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon },
    { path: '/inventario', label: 'Inventário', icon: InventoryIcon },
    { path: '/skins', label: 'CS:GO Skins', icon: SkinIcon },
    { path: '/caixas', label: 'Caixas', icon: BoxIcon },
    { path: '/investimentos', label: 'Investimentos', icon: InvestmentIcon },
    { path: '/despesas', label: 'Despesas', icon: ExpenseIcon },
  ];

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cs-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">CS</span>
              </div>
              <span className="text-white font-bold text-sm sm:text-base hidden sm:block">CS2 Earnings</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center px-2 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden lg:inline text-xs sm:text-sm">{user?.username}</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform" style={{transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-3 sm:px-4 py-2 border-b border-slate-700">
                      <p className="text-white font-medium text-sm">{user?.fullName}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        // TODO: Implementar página de perfil
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Perfil
                      </span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 sm:px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-cs-orange text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay para fechar menus quando clicar fora */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navigation;