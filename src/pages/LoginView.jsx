import React, { useState } from 'react';
import { Icons } from '../components/Icons';

export const LoginView = ({ onLogin, onBack, initialMode = 'login', isDark }) => {
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

  const theme = {
    overlay: "bg-gab-darker/60 backdrop-blur-md",
    card: isDark ? "bg-gab-dark border-gab-gold/20 shadow-gab-gold/5" : "bg-white border-slate-200 shadow-xl",
    title: isDark ? "text-white" : "text-gab-dark",
    subtitle: "text-gab-gold",
    tabBg: isDark ? "bg-gab-darker/50 border-white/5" : "bg-slate-100 border-slate-200",
    tabActive: "bg-gab-gold text-gab-dark shadow-md",
    tabInactive: isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-gab-dark",
    inputBg: isDark ? "bg-gab-darker/80 border-white/10 text-white placeholder-slate-500 focus:border-gab-gold/50 focus:ring-gab-gold/30" : "bg-white border-slate-300 text-gab-dark placeholder-slate-400 focus:border-gab-gold/80 focus:ring-gab-gold/30",
    icon: isDark ? "text-slate-500 group-focus-within:text-gab-gold" : "text-slate-400 group-focus-within:text-gab-gold",
    btnSubmit: "bg-gab-gold hover:brightness-110 text-gab-dark shadow-lg shadow-gab-gold/20",
    closeBtn: isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-gab-dark hover:bg-slate-100",
    link: "text-gab-gold hover:brightness-125"
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-center items-center p-4 font-sans ${theme.overlay} animate-in fade-in duration-300`}>
      {/* Login/Register Container */}
      <div className={`w-full max-w-md relative p-8 sm:p-10 rounded-[2.5rem] border shadow-2xl transition-colors duration-500 ${theme.card} animate-in zoom-in-95 slide-in-from-bottom-4 duration-500`}>
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8 relative">
          {onBack && (
            <button 
              onClick={onBack}
              className={`absolute -right-4 -top-4 md:-right-6 md:-top-6 p-2 rounded-full transition-all ${theme.closeBtn}`}
              title="Fechar"
            >
              <Icons.X />
            </button>
          )}
          <div className="w-16 h-16 text-gab-gold flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-500">
            <Icons.GabLogo className="w-16 h-16 drop-shadow-md" />
          </div>
          <h1 className={`text-2xl font-serif font-bold tracking-widest leading-none mb-1 ${theme.title}`}>
            GAB — ASSESP
          </h1>
          <p className={`text-[10px] font-bold tracking-[0.2em] leading-none uppercase ${theme.subtitle}`}>
            Setor Jurídico | PPMA
          </p>
        </div>

        {/* Toggle Switches */}
        <div className={`flex p-1 rounded-2xl mb-8 border transition-colors duration-500 ${theme.tabBg}`}>
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${isLogin ? theme.tabActive : theme.tabInactive}`}
          >
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${!isLogin ? theme.tabActive : theme.tabInactive}`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Registration specific fields */}
          {!isLogin && (
            <div className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${theme.icon}`}>
                <Icons.User />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo" 
                className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${theme.inputBg}`}
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Input */}
          <div className="relative group animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${theme.icon}`}>
              <Icons.Mail />
            </div>
            <input 
              type="email" 
              value={isLogin ? email : regEmail}
              onChange={(e) => isLogin ? setEmail(e.target.value) : setRegEmail(e.target.value)}
              placeholder="Seu e-mail corporativo" 
              className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${theme.inputBg}`}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${theme.icon}`}>
              <Icons.Eye />
            </div>
            <input 
              type="password" 
              value={isLogin ? password : regPassword}
              onChange={(e) => isLogin ? setPassword(e.target.value) : setRegPassword(e.target.value)}
              placeholder={isLogin ? "Sua senha" : "Crie uma senha forte"} 
              className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${theme.inputBg}`}
              required
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm pt-2 animate-in fade-in duration-500">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-gab-gold focus:ring-gab-gold/50 focus:ring-offset-slate-900" />
                <span className={`transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-gab-dark'}`}>Lembrar de mim</span>
              </label>
              <button type="button" className={`font-medium transition-colors ${theme.link}`}>Esqueci a senha</button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full mt-4 py-3.5 px-4 text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${theme.btnSubmit}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gab-dark/30 border-t-gab-dark rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Entrar no Sistema' : 'Criar Conta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
