import React, { useState } from 'react';
import { Icons } from '../components/Icons';

export const LoginView = ({ onLogin, onBack, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      if (isLogin) {
        onLogin();
      } else {
        // Mock registration success, switch to login or auto-login
        onLogin();
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Premium Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Login/Register Container */}
      <div className="w-full max-w-md z-10 relative">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-black/50">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-10 relative">
            {onBack && (
              <button 
                onClick={onBack}
                className="absolute -left-4 -top-4 md:-left-8 md:-top-8 p-3 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-all"
                title="Voltar para o início"
              >
                <Icons.X />
              </button>
            )}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white mb-6 transform hover:rotate-12 transition-transform duration-500">
              <Icons.Scale />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Sistema Gab</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">Gestão Integrada de Ativos</p>
          </div>

          {/* Toggle Switches */}
          <div className="flex p-1 bg-slate-800/50 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Cadastrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Registration specific fields */}
            {!isLogin && (
              <div className="relative group animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Icons.User />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email Input */}
            <div className="relative group animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Icons.Mail />
              </div>
              <input 
                type="email" 
                value={isLogin ? email : regEmail}
                onChange={(e) => isLogin ? setEmail(e.target.value) : setRegEmail(e.target.value)}
                placeholder="Seu e-mail corporativo" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Icons.Eye />
              </div>
              <input 
                type="password" 
                value={isLogin ? password : regPassword}
                onChange={(e) => isLogin ? setPassword(e.target.value) : setRegPassword(e.target.value)}
                placeholder={isLogin ? "Sua senha" : "Crie uma senha forte"} 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm pt-2 animate-in fade-in duration-500">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-slate-900" />
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Lembrar de mim</span>
                </label>
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Esqueci a senha</a>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Entrar no Sistema' : 'Criar Conta'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          &copy; 2026 Gabinete Administrativo. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
