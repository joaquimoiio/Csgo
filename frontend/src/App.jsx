import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import CSGOSkins from './pages/CSGOSkins';
import Caixas from './pages/Caixas';
import Investimentos from './pages/Investimentos';
import Despesas from './pages/Despesas';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <div className="min-h-screen bg-slate-900">
            <Navigation />
            <div className="px-0 sm:px-4 py-4 sm:py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/skins" element={<CSGOSkins />} />
              <Route path="/caixas" element={<Caixas />} />
              <Route path="/investimentos" element={<Investimentos />} />
              <Route path="/despesas" element={<Despesas />} />
            </Routes>
            </div>
          </div>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;