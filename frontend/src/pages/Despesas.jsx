import { useState, useEffect } from 'react';
import { earningsService } from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import { ExpenseIcon, DeleteIcon } from '../components/Icons';

const Despesas = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadExpenses = async () => {
    try {
      const response = await earningsService.getByType('despesas');
      const expenseData = response.data.data || []; // Acessar response.data.data devido à nova estrutura
      setExpenses(expenseData);
      
      const totalAmount = expenseData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setTotal(totalAmount);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      setExpenses([]); // Garantir que expenses seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta despesa?')) return;
    
    try {
      await earningsService.delete(id);
      loadExpenses();
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
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
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <ExpenseIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Despesas</h1>
              <p className="text-slate-400">Controle de gastos e investimentos</p>
            </div>
          </div>
          
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 max-w-md">
            <div className="flex justify-between items-center">
              <span className="text-red-400 font-medium">Total Despesas:</span>
              <span className="text-red-400 font-bold text-xl">{formatCurrency(total)}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-red-400">Adicionar Despesa</h3>
              <ExpenseForm onExpenseAdded={loadExpenses} />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-red-400">Histórico de Despesas</h3>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded"></div>
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhuma despesa registrada ainda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {expense.name && (
                          <span className="text-white font-semibold">{expense.name}</span>
                        )}
                        {expense.amount && (
                          <span className="text-red-400 font-bold">
                            -{formatCurrency(expense.amount)}
                          </span>
                        )}
                      </div>
                      
                      {expense.description && (
                        <p className="text-slate-300 text-sm mb-1">{expense.description}</p>
                      )}
                      <p className="text-slate-400 text-xs">{formatDate(expense.date)}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"
                      title="Deletar despesa"
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

export default Despesas;