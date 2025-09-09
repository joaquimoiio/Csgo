import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const { login, register, loading, error, clearError } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!formData.username || !formData.password) {
      return;
    }

    try {
      await login(formData.username, formData.password);
      // O redirecionamento será feito pelo AuthContext/App
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!registerData.username || !registerData.email || !registerData.password) {
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('Senhas não coincidem');
      return;
    }

    try {
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName || registerData.username
      });
      
      // Registro bem-sucedido, voltar para login
      alert('Usuário criado com sucesso! Faça login para continuar.');
      setIsRegistering(false);
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
      });
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cs-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">CS</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CS:GO Earnings</h1>
          <p className="text-slate-400">Gerencie seus ganhos no Counter-Strike</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => {
                setIsRegistering(false);
                clearError();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isRegistering
                  ? 'bg-cs-orange text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                clearError();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isRegistering
                  ? 'bg-cs-orange text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Login Form */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Usuário ou Email
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Digite seu usuário ou email"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cs-orange hover:bg-cs-orange/80 disabled:bg-cs-orange/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Digite seu nome completo"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Usuário *
                </label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Escolha um nome de usuário (3-50 caracteres)"
                  required
                  autoComplete="username"
                  minLength="3"
                  maxLength="50"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Digite seu email"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Mínimo 8 caracteres incluindo pelo menos 1 número"
                  required
                  autoComplete="new-password"
                  minLength="8"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cs-orange focus:ring-1 focus:ring-cs-orange focus:outline-none transition-colors"
                  placeholder="Digite a senha novamente"
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cs-orange hover:bg-cs-orange/80 disabled:bg-cs-orange/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
          )}

          {/* Info sobre registro */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-slate-300 text-sm text-center">
              {!isRegistering ? (
                <>Não tem uma conta? <button onClick={() => setIsRegistering(true)} className="text-cs-orange hover:text-cs-orange/80">Registre-se aqui</button></>
              ) : (
                <>Já tem uma conta? <button onClick={() => setIsRegistering(false)} className="text-cs-orange hover:text-cs-orange/80">Faça login aqui</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;