import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { useTheme } from '../contexts/ThemeContext';
import logoImg from '../assets/logo.png';

export const LandingView = ({ onOpenLogin, onOpenRegister }) => {
  const { isDark, toggleTheme } = useTheme();

  // Tema dinâmico integrando as cores GAB (Dark e Gold)
  const theme = {
    bg: isDark ? "bg-gab-dark text-slate-200" : "bg-slate-50 text-gab-dark",
    header: isDark ? "bg-gab-dark/85 border-white/5 shadow-2xl shadow-black/50" : "bg-white/85 border-slate-200 shadow-md",
    logoText: isDark ? "text-white drop-shadow-md" : "text-gab-dark",
    logoSubtitle: "text-gab-gold",
    btnGhost: isDark ? "text-slate-300 hover:text-gab-gold" : "text-gab-dark hover:text-gab-gold",
    title: isDark ? "text-white" : "text-gab-dark",
    titleHighlight: "text-transparent bg-clip-text bg-gradient-to-r from-gab-gold to-gab-gold-light",
    subtitle: isDark ? "text-slate-400" : "text-slate-600",
    featureCard: isDark ? "bg-gab-darker/80 border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
    featureTitle: isDark ? "text-white" : "text-gab-dark",
    featureDesc: isDark ? "text-slate-400" : "text-slate-600",
    btnPrimary: "bg-gab-gold hover:bg-gab-gold-light hover:brightness-110 text-gab-dark shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]",
    btnSecondary: isDark
      ? "bg-gab-darker text-white hover:bg-slate-800 border-slate-700"
      : "bg-white text-gab-dark hover:bg-slate-50 border-slate-200",
    footer: isDark ? "border-white/5 text-slate-500" : "border-slate-200 text-slate-500",
    blob1: isDark ? "bg-gab-gold/10" : "bg-gab-gold/20",
    blob2: isDark ? "bg-blue-900/20" : "bg-blue-200/50",
  };

  const navLinkStyle = `relative text-sm font-bold uppercase tracking-widest transition-colors py-1 ${theme.btnGhost} after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:-bottom-1 after:left-0 after:bg-gab-gold after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left`;

  return (
    <div className={`min-h-screen font-sans selection:bg-gab-gold/30 overflow-x-hidden transition-colors duration-500 ${theme.bg}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <img src={logoImg} alt="Logo Watermark" className="absolute w-[80vw] max-w-[600px] object-contain opacity-[0.03] dark:opacity-[0.05]" />
        <div className={`absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-multiply transition-colors duration-500 animate-pulse-slow ${theme.blob1}`}></div>
        <div className={`absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply transition-colors duration-500 animate-pulse-slow ${theme.blob2}`} style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 px-8 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between border-b backdrop-blur-xl transition-colors duration-500 ${theme.header}`}>
        {/* Left side */}
        <div className="flex items-center gap-5 justify-start">
          <div className="w-20 h-20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img src={logoImg} alt="Logo GAB" className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
          </div>
          <div className="flex flex-col justify-center">
            <span className={`text-lg md:text-xl font-serif font-bold tracking-wide leading-tight mb-1 ${theme.logoText}`}>
              Sistema de Gerenciamento de Contratos - SGC
            </span>
            <span className={`text-xs font-bold tracking-[0.2em] leading-none mb-1 ${theme.logoSubtitle}`}>
              GAB - ASSESP | PPMA
            </span>
            <span className={`text-[10px] tracking-widest uppercase leading-none opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ASSESSORIA ESPECIAL
            </span>
          </div>
        </div>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex flex-1 items-center justify-end pr-10 gap-10">
          <a href="#inicio" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={navLinkStyle}>Início</a>
          <a href="#recursos" onClick={(e) => { e.preventDefault(); document.getElementById('recursos').scrollIntoView({ behavior: 'smooth' }); }} className={navLinkStyle}>Recursos</a>
          <a href="#sobre" onClick={(e) => { e.preventDefault(); document.getElementById('sobre').scrollIntoView({ behavior: 'smooth' }); }} className={navLinkStyle}>Sobre</a>
          <a href="#contato" onClick={(e) => { e.preventDefault(); document.getElementById('contato').scrollIntoView({ behavior: 'smooth' }); }} className={navLinkStyle}>Contato</a>
        </nav>

        {/* Right side: Actions */}
        <div className="flex shrink-0 items-center justify-end gap-5 mt-4 md:mt-0">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-inner'}`}
            title="Alternar Tema"
          >
            {isDark ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-2"></div>

          <button
            onClick={onOpenLogin}
            className={`px-8 py-3 text-sm font-bold tracking-wide rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 ${theme.btnPrimary}`}
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-start pt-[10vh] md:pt-[15vh] min-h-[calc(100vh-100px)] px-6 text-center max-w-5xl mx-auto pb-20">
        <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 mt-12 sm:mt-0 transition-colors duration-500 ${theme.title}`}>
          Excelência em <br className="hidden md:block" />
          <span className={theme.titleHighlight}>
            Assessoramento Jurídico
          </span>
        </h1>

        <p className={`text-lg md:text-xl max-w-2xl mb-12 leading-relaxed transition-colors duration-500 ${theme.subtitle}`}>
          Centralize contratos, acompanhe processos e garanta <strong>conformidade total</strong> para o seu setor com nossa plataforma integrada e inteligente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={onOpenLogin}
            className={`px-10 py-4 text-lg font-bold rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${theme.btnPrimary}`}
          >
            Acessar Sistema <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div id="recursos" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 md:mt-16 text-left w-full">
          <div className={`p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDark ? 'hover:border-gab-gold/40 hover:shadow-gab-gold/10' : 'hover:border-gab-gold/50'} ${theme.featureCard}`}>
            <div className="w-14 h-14 rounded-2xl bg-gab-gold/20 text-gab-gold flex items-center justify-center mb-6 shadow-inner">
              <Icons.ShieldCheck size={28} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${theme.featureTitle}`}>Segurança Total</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Ambiente restrito com múltiplos níveis de acesso e proteção, garantindo o sigilo e a integridade de todas as informações.</p>
          </div>
          <div className={`p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDark ? 'hover:border-gab-gold/40 hover:shadow-gab-gold/10' : 'hover:border-gab-gold/50'} ${theme.featureCard}`}>
            <div className="w-14 h-14 rounded-2xl bg-gab-gold/20 text-gab-gold flex items-center justify-center mb-6 shadow-inner">
              <Icons.FileText size={28} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${theme.featureTitle}`}>Controle de Contratos</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Acompanhe prazos de vigência, aditivos e execução financeira sem perder nenhuma data crítica com nosso dashboard.</p>
          </div>
          <div className={`p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isDark ? 'hover:border-gab-gold/40 hover:shadow-gab-gold/10' : 'hover:border-gab-gold/50'} ${theme.featureCard}`}>
            <div className="w-14 h-14 rounded-2xl bg-gab-gold/20 text-gab-gold flex items-center justify-center mb-6 shadow-inner">
              <Icons.Scale size={28} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${theme.featureTitle}`}>Compliance 360°</h3>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>Garanta que todas as operações do setor atendam às normas e estejam devidamente auditadas pelo sistema em tempo real.</p>
          </div>
        </div>
      </main>

      {/* Sobre o Setor e Desenvolvimento */}
      <section id="sobre" className="relative z-10 py-20 px-6 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Sobre o Setor */}
          <div className={`flex-1 p-8 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-gab-gold/10 text-gab-gold flex items-center justify-center mb-6">
              <Icons.Briefcase size={24} />
            </div>
            <h3 className={`text-2xl font-serif font-bold mb-4 ${theme.titleHighlight}`}>O Setor Jurídico</h3>
            <p className={`text-sm leading-relaxed mb-4 ${theme.featureDesc}`}>
              O Gabinete da Assessoria Especial (GAB - ASSESP) atua de forma estratégica na orientação e controle da legalidade das ações do PPMA.
            </p>
            <p className={`text-sm leading-relaxed ${theme.featureDesc}`}>
              Nosso objetivo é garantir que todas as etapas operacionais, contratuais e financeiras ocorram com total transparência, segurança e em conformidade com as diretrizes legais vigentes, resguardando os interesses da instituição.
            </p>
          </div>

          {/* Sobre o Desenvolvedor */}
          <div className={`flex-1 p-8 rounded-3xl border backdrop-blur-sm transition-colors duration-500 ${theme.featureCard}`}>
            <div className="w-12 h-12 rounded-2xl bg-gab-gold/10 text-gab-gold flex items-center justify-center mb-6">
              <Icons.User size={24} />
            </div>
            <h3 className={`text-2xl font-serif font-bold mb-4 ${theme.titleHighlight}`}>Desenvolvimento</h3>
            <p className={`text-sm leading-relaxed mb-4 ${theme.featureDesc}`}>
              Este sistema foi idealizado e desenvolvido sob medida para as necessidades específicas do setor, focando em automação, rastreabilidade e facilidade de uso.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl border-2 border-gab-gold/50">
                R
              </div>
              <div>
                <p className={`font-bold ${theme.featureTitle}`}>Desenvolvido por Raphael</p>
                <p className={`text-xs uppercase tracking-widest mt-1 ${theme.featureDesc}`}>Engenharia de Software</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer id="contato" className={`relative z-10 border-t py-12 px-6 transition-colors duration-500 ${theme.footer}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 text-left mb-8">
          {/* Left Column - Aligns with 'O Setor Jurídico' box */}
          <div className="flex-1 px-8">
            <h4 className={`font-bold mb-4 ${isDark ? 'text-gab-gold' : 'text-gab-dark'}`}>GAB — ASSESP</h4>
            <p className="text-sm opacity-80 leading-relaxed">Sistema Oficial de Gestão Jurídica para centralização e controle de contratos e processos operacionais do PPMA.</p>
          </div>
          
          {/* Right Column - Aligns with 'Desenvolvimento' box */}
          <div className="flex-1 px-8 flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-gab-gold' : 'text-gab-dark'}`}>
                <Icons.Briefcase size={16} /> Contato do Setor
              </h4>
              <p className="text-sm opacity-80 leading-relaxed">
                <strong>E-mail Institucional:</strong><br/>
                gabinete.assesp@ppma.ma.gov.br<br/><br/>
                <strong>Telefone:</strong><br/>
                (00) 0000-0000
              </p>
            </div>

            <div className="flex-1">
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-gab-gold' : 'text-gab-dark'}`}>
                <Icons.User size={16} /> Contato do Desenvolvedor
              </h4>
              <div className="text-sm opacity-80 leading-relaxed flex flex-col gap-3">
                <a href="mailto:raphael.csa23@gmail.com" className="flex items-center gap-2 hover:text-gab-gold transition-colors">
                  <Icons.Mail size={16} /> raphael.csa23@gmail.com
                </a>
                <a href="https://www.linkedin.com/in/raphael-camara-s%C3%A1-929749275/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gab-gold transition-colors">
                  <Icons.Linkedin size={16} /> LinkedIn
                </a>
                <a href="https://github.com/Rapha23cs" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gab-gold transition-colors">
                  <Icons.Github size={16} /> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-sm pt-8 border-t border-slate-200 dark:border-white/5 opacity-60">
          &copy; 2026 GABINETE DA ASSESSORIA ESPECIAL - SETOR JURÍDICO | PPMA. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};
