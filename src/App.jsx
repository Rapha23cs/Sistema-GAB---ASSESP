import React, { Component } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Icons } from './components/Icons';
import { OrdersView } from './pages/OrdersView';
import { EquipmentsView } from './pages/EquipmentsView';
import { ContratosView } from './pages/ContratosView';
import { LicitacoesView } from './pages/LicitacoesView';
import { FinanceiroView } from './pages/FinanceiroView';
import { ColaboracaoView } from './pages/ColaboracaoView';
import { LoginView } from './pages/LoginView';
import { LandingView } from './pages/LandingView';
import { DashboardView } from './pages/DashboardView';
import { AdminUsersView } from './pages/AdminUsersView';
import { GlobalSearch } from './components/GlobalSearch';
import { NotificationBell } from './components/NotificationBell';
import { SettingsView } from './pages/SettingsView';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-rose-600 h-full flex flex-col items-center justify-center bg-slate-50">
          <h2 className="text-2xl font-bold mb-4">Ocorreu um erro no render da tela</h2>
          <div className="bg-rose-50 p-6 rounded-xl border border-rose-200 max-w-3xl w-full shadow-sm">
            <p className="font-mono text-sm mb-4 text-rose-800">{this.state.error && this.state.error.toString()}</p>
            <pre className="text-xs text-rose-600 overflow-auto max-h-64">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper para Auth Flow (Landing, Login, Register) para não poluir o App Main
function AuthFlow() {
  const [showAuthFlow, setShowAuthFlow] = React.useState(false);
  const [initialAuthMode, setInitialAuthMode] = React.useState('login');

  return (
    <div className="relative">
      <LandingView 
        onOpenLogin={() => { setInitialAuthMode('login'); setShowAuthFlow(true); }}
        onOpenRegister={() => { setInitialAuthMode('register'); setShowAuthFlow(true); }}
      />
      {showAuthFlow && (
        <LoginView 
          onBack={() => setShowAuthFlow(false)}
          initialMode={initialAuthMode}
        />
      )}
    </div>
  );
}

/* --- MAIN APP --- */
export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  // Helper para nome da rota atual
  const getActiveTabName = () => {
    const path = location.pathname.substring(1);
    const routeMap = {
      '': 'Dashboard',
      'dashboard': 'Dashboard',
      'ordens': 'Ordens de Serviço',
      'equipamentos': 'Equipamentos',
      'contratos': 'Contratos',
      'licitacoes': 'Licitações',
      'financeiro': 'Financeiro',
      'colaboracao': 'Colaboração',
      'usuarios': 'Usuários',
      'configuracoes': 'Configurações'
    };
    return routeMap[path] || 'Página Não Encontrada';
  };

  const activeTab = getActiveTabName();

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthFlow />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30 transition-colors duration-500">

        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-gab-darker border-r border-slate-200 dark:border-white/5 flex flex-col transition-colors duration-500 z-20 shadow-sm">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 text-gab-gold flex items-center justify-center shrink-0">
              <Icons.GabLogo className="w-10 h-10 drop-shadow-sm" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-serif font-bold tracking-widest leading-none mb-1 text-gab-dark dark:text-white">
                GAB — ASSESP
              </span>
              <span className="text-[9px] font-bold tracking-[0.15em] leading-none text-gab-gold">
                SETOR JURÍDICO | PPMA
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              'Dashboard', 'Colaboração', 'Contratos', 'Licitações', 'Financeiro', 'Ordens de Serviço', 'Equipamentos', 'Usuários', 'Configurações'
            ].map((item) => {
              const isActive = activeTab === item;
              let IconComponent;
              switch (item) {
                case 'Dashboard': IconComponent = Icons.Home; break;
                case 'Ordens de Serviço': IconComponent = Icons.Briefcase; break;
                case 'Equipamentos': IconComponent = Icons.Monitor; break;
                case 'Contratos': IconComponent = Icons.FileSignature; break;
                case 'Licitações': IconComponent = Icons.Landmark; break;
                case 'Financeiro': IconComponent = Icons.DollarSign; break;
                case 'Colaboração': IconComponent = Icons.MessageSquare; break;
                case 'Usuários': IconComponent = Icons.User; break;
                case 'Configurações': IconComponent = Icons.Settings; break;
                default: IconComponent = Icons.Home;
              }

              const path = item === 'Ordens de Serviço' ? 'ordens' : item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return (
                <NavLink
                  to={`/${path}`}
                  key={item}
                  className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-blue-50 dark:bg-gab-gold/10 text-blue-800 dark:text-gab-gold font-semibold shadow-sm border border-blue-100 dark:border-gab-gold/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gab-dark hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  <IconComponent />
                  {item}
                </NavLink>
              )
            })}
          </nav>

          <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex items-center gap-3 transition-colors duration-500">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'User')}&background=random`} alt="User Avatar" className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role === 'Admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="text-slate-400 hover:text-yellow-500 transition-colors cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Alternar Tema"
            >
              {isDark ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <button 
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-700"
              title="Encerrar sessão"
            >
              <Icons.LogOut />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          {/* Background glow effects */}
          <div className="fixed top-0 left-1/2 w-[800px] h-[300px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none transition-colors duration-500" />
          <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-slate-200/50 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />

          {/* Header */}
          <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-colors duration-500">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeTab}</h1>

            <div className="flex items-center gap-6">
              <GlobalSearch setActiveTab={(tab) => {
                const path = tab === 'Ordens de Serviço' ? 'ordens' : tab.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                navigate(`/${path}`);
              }} />
              <NotificationBell setActiveTab={(tab) => {
                const path = tab === 'Ordens de Serviço' ? 'ordens' : tab.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                navigate(`/${path}`);
              }} />
            </div>
          </header>

          <Toaster position="top-right" />

          {/* Dynamic View Rendering based on active tab */}
          <div className="p-8 flex-1 z-0 relative">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView setActiveTab={(tab) => {
                const path = tab.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                navigate(`/${path}`);
              }} />} />
              <Route path="/ordens" element={<OrdersView />} />
              <Route path="/equipamentos" element={<EquipmentsView />} />
              <Route path="/contratos" element={<ContratosView />} />
              <Route path="/licitacoes" element={<LicitacoesView />} />
              <Route path="/financeiro" element={<FinanceiroView />} />
              <Route path="/colaboracao" element={<ColaboracaoView />} />
              <Route path="/usuarios" element={<AdminUsersView />} />
              <Route path="/configuracoes" element={<SettingsView />} />
              <Route path="*" element={
                <div className="flex items-center justify-center h-full text-zinc-500">
                  Módulo "{activeTab}" não encontrado.
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
