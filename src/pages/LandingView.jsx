import React, { useState } from 'react';
import { Icons } from '../components/Icons';

export const LandingView = ({ isDark, setIsDark, onOpenLogin, onOpenRegister }) => {
  // Tema dinâmico
  const theme = {
    bg: isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-800",
    header: isDark ? "bg-slate-950/50 border-white/5" : "bg-white/70 border-slate-200 shadow-sm",
    logo: isDark ? "text-white" : "text-slate-900",
    btnGhost: isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900",
    title: isDark ? "text-white" : "text-slate-900",
    subtitle: isDark ? "text-slate-400" : "text-slate-600",
    featureCard: isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
    featureTitle: isDark ? "text-white" : "text-slate-900",
    featureDesc: isDark ? "text-slate-400" : "text-slate-600",
    btnSecondary: isDark 
      ? "bg-slate-800 text-white hover:bg-slate-700 border-slate-700" 
      : "bg-white text-slate-800 hover:bg-slate-50 border-slate-200",
    footer: isDark ? "border-white/5 text-slate-600" : "border-slate-200 text-slate-500",
    blob1: isDark ? "bg-blue-900/20" : "bg-blue-200/50",
    blob2: isDark ? "bg-indigo-900/20" : "bg-indigo-200/50",
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500 ${theme.bg}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-multiply transition-colors duration-500 animate-pulse-slow ${theme.blob1}`}></div>
        <div className={`absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply transition-colors duration-500 animate-pulse-slow ${theme.blob2}`} style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative z-50 px-6 py-4 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-500 ${theme.header}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg text-white">
            <Icons.Scale />
          </div>
          <span className={`text-xl font-bold tracking-tight ${theme.logo}`}>Sistema Gab</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            title="Alternar Tema"
          >
            {isDark ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-2"></div>

          <button 
            onClick={onOpenLogin}
            className={`px-3 sm:px-5 py-2 text-sm font-semibold transition-colors ${theme.btnGhost}`}
          >
            Entrar
          </button>
          <button 
            onClick={onOpenRegister}
            className="px-4 sm:px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all active:scale-95"
          >
            Cadastrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center max-w-5xl mx-auto pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-8 tracking-wide mt-12 sm:mt-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          NOVO SISTEMA DE GESTÃO JURÍDICA
        </div>

        <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 transition-colors duration-500 ${theme.title}`}>
          Excelência em <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
            Administração Legal
          </span>
        </h1>
        
        <p className={`text-lg md:text-xl max-w-2xl mb-12 leading-relaxed transition-colors duration-500 ${theme.subtitle}`}>
          Centralize contratos, controle processos operacionais e garanta conformidade total para o seu setor jurídico com nossa plataforma inteligente e segura.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={onOpenRegister}
            className="px-8 py-4 text-base font-bold bg-blue-600 text-white hover:bg-blue-500 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Começar agora <Icons.FileSignature />
          </button>
          <button 
            onClick={onOpenLogin}
            className={`px-8 py-4 text-base font-bold rounded-2xl shadow-xl border transition-all active:scale-95 flex items-center justify-center gap-2 ${theme.btnSecondary}`}
          >
            Acessar Sistema <Icons.Monitor />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Icons.ShieldCheck />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.featureTitle}`}>Segurança Total</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Proteção de dados com criptografia de ponta a ponta, garantindo o sigilo das informações jurídicas.</p>
          </div>
          <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Icons.FileText />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.featureTitle}`}>Controle de Contratos</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Gerencie prazos, aditivos e assinaturas de forma centralizada e sem perder nenhuma data crítica.</p>
          </div>
          <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Icons.Scale />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.featureTitle}`}>Compliance</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Auditoria completa de acessos e modificações, mantendo seu escritório sempre em conformidade legal.</p>
          </div>
        </div>
      </main>

      <footer className={`relative z-10 border-t py-8 text-center text-sm transition-colors duration-500 ${theme.footer}`}>
        &copy; 2026 Sistema Gabinete ASSESP. Setor Jurídico.
      </footer>
    </div>
  );
};
