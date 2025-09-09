import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import CSGOSkins from './pages/CSGOSkins';
import Caixas from './pages/Caixas';
import Investimentos from './pages/Investimentos';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/skins" element={<CSGOSkins />} />
          <Route path="/caixas" element={<Caixas />} />
          <Route path="/investimentos" element={<Investimentos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;