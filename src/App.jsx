import React, { useState, Component } from 'react';
import { Icons } from './components/Icons';
import { OrdersView } from './pages/OrdersView';
import { EquipmentsView } from './pages/EquipmentsView';
import { ContratosView } from './pages/ContratosView';
import { LicitacoesView } from './pages/LicitacoesView';
import { ColaboracaoView } from './pages/ColaboracaoView';
import { LoginView } from './pages/LoginView';
import { DashboardView } from './pages/DashboardView';

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

// Reusable SVG Icons

/* --- MAIN APP --- */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard'); // Starts with Dashboard

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginView onLogin={() => setIsAuthenticated(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-blue-500/30">

        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col transition-all z-20 shadow-sm">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-900/20 text-white">
              <Icons.Briefcase />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Sistema Gab</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {['Dashboard', 'Ordens', 'Equipamentos', 'Contratos', 'Licitações', 'Colaboração', 'Configurações'].map((item) => {
              const isActive = activeTab === item;
              let IconComponent;
              switch (item) {
                case 'Dashboard': IconComponent = Icons.Home; break;
                case 'Ordens': IconComponent = Icons.Briefcase; break;
                case 'Equipamentos': IconComponent = Icons.Monitor; break;
                case 'Contratos': IconComponent = Icons.FileSignature; break;
                case 'Licitações': IconComponent = Icons.Landmark; break;
                case 'Colaboração': IconComponent = Icons.MessageSquare; break;
                case 'Configurações': IconComponent = Icons.Settings; break;
                default: IconComponent = Icons.Home;
              }

              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold shadow-sm border border-blue-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    } cursor-pointer`}
                >
                  <IconComponent />
                  {item}
                </button>
              )
            })}
          </nav>

          <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" className="w-10 h-10 rounded-full border border-slate-300 shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Raphael S.</p>
              <p className="text-xs text-slate-500 truncate">Administrador</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          {/* Background glow effects */}
          <div className="fixed top-0 left-1/2 w-[800px] h-[300px] bg-blue-100/50 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none" />
          <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-slate-200/50 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">{activeTab}</h1>

            <div className="flex items-center gap-6">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar no sistema..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all w-80 placeholder:text-slate-400 text-slate-900 shadow-inner"
                />
              </div>
              <button className="relative text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                <Icons.Bell />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>

          {/* Dynamic View Rendering based on active tab */}
          <div className="p-8 flex-1 z-0 relative">
            {activeTab === 'Dashboard' && <DashboardView />}
            {activeTab === 'Ordens' && <OrdersView />}
            {activeTab === 'Equipamentos' && <EquipmentsView />}
            {activeTab === 'Contratos' && <ContratosView />}
            {activeTab === 'Licitações' && <LicitacoesView />}
            {activeTab === 'Colaboração' && <ColaboracaoView />}
            {(activeTab !== 'Dashboard' && activeTab !== 'Ordens' && activeTab !== 'Equipamentos' && activeTab !== 'Contratos' && activeTab !== 'Licitações' && activeTab !== 'Colaboração') && (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Módulo "{activeTab}" em desenvolvimento...
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
