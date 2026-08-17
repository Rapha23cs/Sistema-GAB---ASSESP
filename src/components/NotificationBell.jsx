import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { apiFetch, API_URL } from '../config';

const parseDateOutside = (dStr) => {
  if (!dStr) return 0;
  let str = dStr.trim().split(' ')[0];
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    }
  }
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }
  }
  return 0;
};

export const NotificationBell = ({ setActiveTab, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevAlertsStrRef = useRef(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const [eqRes, contRes, tarRes, finRes] = await Promise.all([
          apiFetch(`${API_URL}/api/equipamentos`),
          apiFetch(`${API_URL}/api/contratos`),
          apiFetch(`${API_URL}/api/tarefas?t=${Date.now()}`),
          apiFetch(`${API_URL}/api/financeiro?t=${Date.now()}`)
        ]);
        
        const eqs = await eqRes.json();
        const conts = await contRes.json();
        const tarefas = await tarRes.json();
        const financ = await finRes.json();
        
        const newAlerts = [];
        
        if (Array.isArray(eqs)) {
          const inop = eqs.filter(e => {
            const s = (e.status || '').toLowerCase();
            return s.includes('inoperante') || s.includes('condenado');
          });
          if (inop.length > 0) {
            newAlerts.push({ 
              id: 'eq',
              title: 'Atenção aos Equipamentos', 
              desc: `Há ${inop.length} equipamento(s) inoperante(s) ou condenado(s) que precisam de atenção.`, 
              icon: Icons.Monitor, 
              color: 'text-rose-500', 
              bg: 'bg-rose-50 dark:bg-rose-900/30',
              tab: 'Equipamentos' 
            });
          }
        }
        
        if (Array.isArray(conts)) {
          const hoje = new Date();
          const vencendo = conts.filter(c => {
            const ts = parseDateOutside(c.vigencia);
            if (!ts) return false;
            const diffDays = Math.ceil((ts - hoje.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 90;
          });
          if (vencendo.length > 0) {
            newAlerts.push({ 
              id: 'cont',
              title: 'Contratos Vencendo', 
              desc: `Você tem ${vencendo.length} contrato(s) vencendo nos próximos 90 dias.`, 
              icon: Icons.AlertCircle, 
              color: 'text-amber-500', 
              bg: 'bg-amber-50 dark:bg-amber-900/30',
              tab: 'Contratos' 
            });
          }
        }

        if (Array.isArray(tarefas) && user) {
          const pending = tarefas.filter(t => !t.completed && t.assignee === user.nome);
          if (pending.length > 0) {
            newAlerts.push({
              id: 'tar_geral',
              title: 'Tarefas Pendentes',
              desc: `Há ${pending.length} tarefa(s) pendente(s) aguardando sua ação.`,
              icon: Icons.CheckSquare,
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-900/30',
              tab: 'Colaboracao'
            });
          }

          const avisos = tarefas.filter(t => t.assignee === 'Todos');
          if (avisos.length > 0) {
            newAlerts.push({
              id: 'avisos',
              title: 'Avisos Gerais no Mural',
              desc: `Há ${avisos.length} aviso(s) importante(s) no fórum para toda a equipe.`,
              icon: Icons.MessageSquare,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-900/30',
              tab: 'Colaboração'
            });
          }
        }
        
        if (Array.isArray(financ)) {
          const financPendentes = financ.filter(f => {
            const snf = (f.status_nf || '').toLowerCase();
            const sob = (f.status_ob || '').toLowerCase();
            return snf.includes('pendente') || sob.includes('aguardando');
          });
          
          if (financPendentes.length > 0) {
            newAlerts.push({
              id: 'fin',
              title: 'Pendências Financeiras',
              desc: `Há ${financPendentes.length} registro(s) financeiro(s) pendente(s) ou aguardando pagamento.`,
              icon: Icons.Landmark,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-900/30',
              tab: 'Financeiro'
            });
          }
        }
        
        setAlerts(newAlerts);
        setLoading(false);

        const newAlertsStr = JSON.stringify(newAlerts);
        
        if (prevAlertsStrRef.current === null) {
          // Initial load
          if (newAlerts.length > 0) {
            setIsOpen(true);
            setTimeout(() => setIsOpen(false), 3000);
          }
        } else if (prevAlertsStrRef.current !== newAlertsStr) {
          // Changes detected (new alerts)
          if (newAlerts.length > 0) {
            setIsOpen(true);
            setTimeout(() => setIsOpen(false), 3000);
          }
        }
        
        prevAlertsStrRef.current = newAlertsStr;

      } catch (err) {
        console.error('Error fetching alerts', err);
        setLoading(false);
      }
    };
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative transition-colors cursor-pointer p-2 rounded-full ${isOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      >
        <Icons.Bell />
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Notificações</h3>
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">{alerts.length} novas</span>
            </div>
            
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : alerts.length > 0 ? (
                alerts.map(alert => (
                  <div 
                    key={alert.id}
                    onClick={() => {
                      setIsOpen(false);
                      if (setActiveTab) setActiveTab(alert.tab);
                    }}
                    className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex gap-4 group"
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alert.bg} ${alert.color}`}>
                      <alert.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{alert.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{alert.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Icons.Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm">Tudo em dia!<br/>Nenhuma notificação no momento.</p>
                </div>
              )}
            </div>
            
            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 text-center">
              <button 
                onClick={() => { setIsOpen(false); setActiveTab('Dashboard'); }}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                Ver todas no Dashboard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
