import React from 'react';
import { Icons } from '../components/Icons';
import { StatusBadge, ContractBadge, EqStatusBadge, LicitacaoStatusBadge } from '../components/Badges';
import { DUMMY_TASKS } from '../data/mockData';

export const DashboardView = () => {
  const pendingTasks = DUMMY_TASKS.filter(t => t.assignee === 'Raphael S.' && !t.completed);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-800 dark:to-indigo-900 border border-blue-600 dark:border-blue-500/50 rounded-3xl p-8 shadow-md transition-colors duration-500">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Sistema Gab, Raphael!</h2>
            <p className="text-blue-100 dark:text-blue-200 text-sm max-w-2xl">
              Aqui está o resumo operacional das suas unidades hoje. Você tem <strong className="text-white font-semibold">14 Ordens de Serviço</strong> em andamento e <strong className="text-amber-300 font-semibold">2 Contratos</strong> vencendo nos próximos 90 dias.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl border border-white/20 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
            <Icons.FileText />
            Gerar Relatório Geral
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'OS em Andamento', value: '14', color: 'bg-white dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.Briefcase, trend: '+3 hoje', trendColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50' },
          { label: 'Equipamentos Inoperantes', value: '2', color: 'bg-white dark:bg-slate-900', text: 'text-rose-600 dark:text-rose-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.Monitor, trend: '-1 hoje', trendColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50' },
          { label: 'Contratos Ativos', value: '12', color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.FileSignature, trend: 'Estável', trendColor: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
          { label: 'Licitações Abertas', value: '15', color: 'bg-white dark:bg-slate-900', text: 'text-purple-600 dark:text-purple-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.Landmark, trend: '+2 nesta semana', trendColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800/50' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 transition-all duration-300 cursor-default group relative overflow-hidden`}>
            <div className="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-10 text-slate-900 dark:text-white transform group-hover:scale-110 transition-transform duration-500">
               <stat.Icon size={120} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.text} border border-slate-100 dark:border-slate-700`}>
                <stat.Icon />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${stat.trendColor}`}>{stat.trend}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Atividades Recentes */}
        <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 transition-colors duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Icons.Clock /> Atividades Recentes
            </h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer">Ver tudo</button>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Nova Licitação Homologada', desc: 'Processo Proc-2026-1044 foi homologado com sucesso.', time: 'Há 10 minutos', Icon: Icons.Landmark, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50' },
              { title: 'Equipamento em Manutenção', desc: 'Bodyscann (SN-BS-11203) foi atualizado para status "Em Manutenção" via OS 65/2026.', time: 'Há 2 horas', Icon: Icons.Wrench, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50' },
              { title: 'Contrato Aditivado', desc: 'O contrato CT-012/2026 teve sua vigência estendida em 12 meses.', time: 'Ontem', Icon: Icons.FileSignature, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50' },
              { title: 'Ordem de Serviço Concluída', desc: 'OS 66/2026 foi finalizada na unidade "Padaria Central".', time: 'Ontem', Icon: Icons.CheckCircle, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 group">
                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${activity.bg} ${activity.color}`}>
                  <activity.Icon />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{activity.title}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activity.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas e Tarefas (Right Column) */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Minhas Tarefas */}
          {pendingTasks.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 transition-colors duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Icons.MessageSquare /> Suas Tarefas
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
              </div>
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group cursor-pointer">
                    <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-relaxed">{task.text}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">De: {task.author}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${task.priority === 'alta' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'}`}>{task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas Críticos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 flex flex-col flex-1 transition-colors duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icons.AlertCircle /> Alertas e Prazos
              </h3>
            </div>
            <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3">
                <Icons.Monitor className="text-rose-600 dark:text-rose-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-300">2 Equipamentos Inoperantes</p>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">Ação requerida imediatamente para restabelecer a segurança.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3">
                <Icons.FileSignature className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Contrato CT-015/2026 Vencendo</p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">Faltam 45 dias para o encerramento do contrato de Pórticos.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3">
                <Icons.Briefcase className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300">3 OS Atrasadas</p>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">Manutenções preventivas fora do prazo de SLA.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
