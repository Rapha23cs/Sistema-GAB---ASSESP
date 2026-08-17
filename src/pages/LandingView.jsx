import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { useTheme } from '../contexts/ThemeContext';

export const LandingView = ({ onOpenLogin, onOpenRegister }) => {
  const { isDark, toggleTheme } = useTheme();

  // Tema dinâmico integrando as cores GAB (Dark e Gold)
  const theme = {
    bg: isDark ? "bg-gab-dark text-slate-200" : "bg-slate-50 text-gab-dark",
    header: isDark ? "bg-gab-dark/90 border-white/5" : "bg-white/90 border-slate-200 shadow-sm",
    logoText: isDark ? "text-white drop-shadow-md" : "text-gab-dark",
    logoSubtitle: "text-gab-gold",
    btnGhost: isDark ? "text-slate-300 hover:text-white" : "text-gab-dark hover:text-black",
    title: isDark ? "text-white" : "text-gab-dark",
    titleHighlight: "text-transparent bg-clip-text bg-gradient-to-r from-gab-gold to-gab-gold-light",
    subtitle: isDark ? "text-slate-400" : "text-slate-600",
    featureCard: isDark ? "bg-gab-darker/80 border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
    featureTitle: isDark ? "text-white" : "text-gab-dark",
    featureDesc: isDark ? "text-slate-400" : "text-slate-600",
    btnPrimary: "bg-gab-gold hover:brightness-110 text-gab-dark shadow-gab-gold/20",
    btnSecondary: isDark
      ? "bg-gab-darker text-white hover:bg-slate-800 border-slate-700"
      : "bg-white text-gab-dark hover:bg-slate-50 border-slate-200",
    footer: isDark ? "border-white/5 text-slate-500" : "border-slate-200 text-slate-500",
    blob1: isDark ? "bg-gab-gold/10" : "bg-gab-gold/20",
    blob2: isDark ? "bg-blue-900/20" : "bg-blue-200/50",
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-gab-gold/30 overflow-x-hidden transition-colors duration-500 ${theme.bg}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-multiply transition-colors duration-500 animate-pulse-slow ${theme.blob1}`}></div>
        <div className={`absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply transition-colors duration-500 animate-pulse-slow ${theme.blob2}`} style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative z-50 px-6 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between border-b backdrop-blur-md transition-colors duration-500 ${theme.header}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 text-gab-gold flex items-center justify-center">
            <Icons.GabLogo className="w-12 h-12" />
          </div>
          <div className="flex flex-col justify-center">
            <span className={`text-2xl font-serif font-bold tracking-widest leading-none mb-1 ${theme.logoText}`}>
              Gestão Contratual
            </span>
            <span className={`text-[10px] font-bold tracking-[0.2em] leading-none mb-0.5 ${theme.logoSubtitle}`}>
              GAB - ASSESP | PPMA
            </span>
            <span className={`text-[8px] tracking-widest uppercase leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ASSESSORIA ESPECIAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            title="Alternar Tema"
          >
            {isDark ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 sm:mx-2"></div>

          <button
            onClick={onOpenLogin}
            className={`px-3 sm:px-5 py-2 text-sm font-semibold transition-colors ${theme.btnGhost}`}
          >
            Entrar
          </button>
          <button
            onClick={onOpenRegister}
            className={`px-4 sm:px-5 py-2 text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 ${theme.btnPrimary}`}
          >
            Cadastrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center max-w-5xl mx-auto pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gab-gold/10 border border-gab-gold/20 text-gab-gold text-xs font-bold mb-8 tracking-wide mt-12 sm:mt-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gab-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gab-gold"></span>
          </span>
          SISTEMA OFICIAL DE GESTÃO JURÍDICA
        </div>

        <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 transition-colors duration-500 ${theme.title}`}>
          Excelência em <br className="hidden md:block" />
          <span className={theme.titleHighlight}>
            Assessoramento Jurídico
          </span>
        </h1>

        <p className={`text-lg md:text-xl max-w-2xl mb-12 leading-relaxed transition-colors duration-500 ${theme.subtitle}`}>
          Centralize contratos, controle processos operacionais e garanta conformidade total para o seu setor jurídico com nossa plataforma inteligente e segura.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={onOpenRegister}
            className={`px-8 py-4 text-base font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${theme.btnPrimary}`}
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
            <div className="w-12 h-12 rounded-2xl bg-gab-gold/20 text-gab-gold flex items-center justify-center mb-4">
              <Icons.ShieldCheck />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.featureTitle}`}>Segurança Total</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Proteção de dados com criptografia de ponta a ponta, garantindo o sigilo das informações jurídicas.</p>
          </div>
          <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-gab-gold/20 text-gab-gold flex items-center justify-center mb-4">
              <Icons.FileText />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.featureTitle}`}>Controle de Contratos</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Gerencie prazos, aditivos e assinaturas de forma centralizada e sem perder nenhuma data crítica.</p>
          </div>
          <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-gab-gold/20 text-gab-gold flex items-center justify-center mb-4">
              <Icons.Scale />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.featureTitle}`}>Compliance</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Auditoria completa de acessos e modificações, mantendo seu escritório sempre em conformidade legal.</p>
          </div>
        </div>
      </main>

      <footer className={`relative z-10 border-t py-8 text-center text-sm transition-colors duration-500 ${theme.footer}`}>
        &copy; 2026 GABINETE DA ASSESSORIA ESPECIAL - SETOR JURÍDICO | PPMA.
      </footer>
    </div>
  );
};
