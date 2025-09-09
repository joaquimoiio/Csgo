import { useState, useEffect } from 'react';
import { earningsService } from '../services/api';
import { InventoryIcon, SteamIcon, MarketIcon, EditIcon, DeleteIcon } from '../components/Icons';

const Inventario = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'skin',
    condition: 'Factory New',
    steamPrice: '',
    marketPrice: '',
    description: ''
  });

  const loadItems = async () => {
    try {
      const response = await earningsService.getByType('inventory');
      const inventoryData = response.data.data || []; // Acessar response.data.data devido à nova estrutura
      setItems(inventoryData);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
      setItems([]); // Garantir que items seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...formData,
        steamPrice: parseFloat(formData.steamPrice) || 0,
        marketPrice: parseFloat(formData.marketPrice) || 0,
        type: 'inventory'
      };

      if (editingItem) {
        // Para edição, vamos usar delete + add como workaround já que não há update
        await earningsService.delete(editingItem.id);
        await earningsService.add(itemData);
      } else {
        await earningsService.add(itemData);
      }
      
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'skin',
      condition: item.condition || 'Factory New',
      steamPrice: item.steamPrice?.toString() || '',
      marketPrice: item.marketPrice?.toString() || '',
      description: item.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) return;
    
    try {
      await earningsService.delete(id);
      loadItems();
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'skin',
      condition: 'Factory New',
      steamPrice: '',
      marketPrice: '',
      description: ''
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getTotalValue = (type) => {
    return items.reduce((sum, item) => {
      return sum + (type === 'steam' ? (item.steamPrice || 0) : (item.marketPrice || 0));
    }, 0);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'skin': 'bg-green-500/20 text-green-400 border-green-500/30',
      'knife': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'gloves': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'case': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'key': 'bg-red-500/20 text-red-400 border-red-500/30',
      'sticker': 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[category] || colors.skin;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <InventoryIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Inventário</h1>
              <p className="text-slate-400">Gerencie seus itens e valores</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SteamIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Valor Steam:</span>
                </div>
                <span className="text-blue-400 font-bold text-xl">{formatCurrency(getTotalValue('steam'))}</span>
              </div>
            </div>
            
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MarketIcon className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">Valor Mercado:</span>
                </div>
                <span className="text-orange-400 font-bold text-xl">{formatCurrency(getTotalValue('market'))}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Adicionar Item
          </button>
        </header>

        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-purple-400">
                {editingItem ? 'Editar Item' : 'Adicionar Item'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">Nome do Item</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500"
                  >
                    <option value="skin">Skin</option>
                    <option value="knife">Faca</option>
                    <option value="gloves">Luvas</option>
                    <option value="case">Caixa</option>
                    <option value="key">Chave</option>
                    <option value="sticker">Sticker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Condição</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500"
                  >
                    <option value="Factory New">Factory New</option>
                    <option value="Minimal Wear">Minimal Wear</option>
                    <option value="Field-Tested">Field-Tested</option>
                    <option value="Well-Worn">Well-Worn</option>
                    <option value="Battle-Scarred">Battle-Scarred</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-2">Valor Steam (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.steamPrice}
                      onChange={(e) => setFormData({...formData, steamPrice: e.target.value})}
                      className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 mb-2">Valor Mercado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.marketPrice}
                      onChange={(e) => setFormData({...formData, marketPrice: e.target.value})}
                      className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">Observações</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500"
                    rows="3"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-colors"
                  >
                    {editingItem ? 'Salvar' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white p-2 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-purple-400">Seus Itens</h3>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <InventoryIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p>Nenhum item no inventário ainda</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    
                    {item.condition && (
                      <p className="text-slate-300 text-sm mb-2">{item.condition}</p>
                    )}
                    
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <SteamIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">{formatCurrency(item.steamPrice)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MarketIcon className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400">{formatCurrency(item.marketPrice)}</span>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full transition-colors"
                      title="Editar item"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"
                      title="Deletar item"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventario;