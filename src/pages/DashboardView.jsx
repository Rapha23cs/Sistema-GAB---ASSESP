import { apiFetch } from '../config';
import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import toast from 'react-hot-toast';

const norm = str => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const parseDateOutside = (dStr) => {
  if (!dStr) return 0;
  let str = dStr.trim().split(' ')[0];
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  } else if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
  }
  return 0;
};

const getStatusGrouped = (ossArray) => {
  const groupedMap = new Map();
  ossArray.forEach(os => {
    const key = os.ordem_servico || `sem-os-${os.id}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, { ...os, statusCount: [], maxDate: 0 });
    }
    const group = groupedMap.get(key);
    
    const tDate = parseDateOutside(os.data_tarefa);
    const trDate = parseDateOutside(os.data_tratativa);
    const rowMax = Math.max(tDate, trDate);
    
    if (rowMax > group.maxDate) {
      group.maxDate = rowMax;
      group.latestDateStr = tDate >= trDate ? os.data_tarefa : os.data_tratativa;
    }

    if (os.status) {
      group.statusCount.push(norm(os.status));
    }
  });

  const groupedOrders = Array.from(groupedMap.values());
  groupedOrders.forEach(go => {
    if (go.latestDateStr) {
      go.data_tarefa = go.latestDateStr;
    }
    if (go.statusCount.length > 0) {
      if (go.statusCount.every(s => s.includes('conclu') || s === 'ok')) {
        go.statusGlobal = 'concluido';
      } else if (go.statusCount.every(s => s === 'aguardando' || s === '')) {
        go.statusGlobal = 'aguardando';
      } else {
        go.statusGlobal = 'pendente';
      }
    } else {
      go.statusGlobal = 'pendente';
    }
  });
  return groupedOrders;
};

import { useAuth } from '../contexts/AuthContext';

export const DashboardView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  const [osFilter, setOsFilter] = useState('todos');
  const [equipFilter, setEquipFilter] = useState('todos');
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [oss, setOss] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [licitacoes, setLicitacoes] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_URL}/api/oss`).then(res => res.json()),
      apiFetch(`${API_URL}/api/contratos`).then(res => res.json()),
      apiFetch(`${API_URL}/api/equipamentos`).then(res => res.json()),
      apiFetch(`${API_URL}/api/tarefas`).then(res => res.json()),
      apiFetch(`${API_URL}/api/licitacoes`).then(res => res.json()),
      apiFetch(`${API_URL}/api/financeiro`).then(res => res.json())
    ]).then(([ossData, contratosData, equipamentosData, tarefasData, licitacoesData, financeiroData]) => {
      setOss(Array.isArray(ossData) ? ossData : []);
      setContratos(Array.isArray(contratosData) ? contratosData : []);
      setEquipamentos(Array.isArray(equipamentosData) ? equipamentosData : []);
      setTarefas(Array.isArray(tarefasData) ? tarefasData : []);
      setLicitacoes(Array.isArray(licitacoesData) ? licitacoesData : []);
      setFinanceiro(Array.isArray(financeiroData) ? financeiroData : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const groupedOS = getStatusGrouped(oss);
  
  const osEmAndamento = groupedOS.filter(o => {
    return o.statusGlobal === 'pendente' || o.statusGlobal === 'aguardando';
  }).length;

  const contratosAtivos = contratos.filter(c => {
    const p = (c.pendencia || '').toLowerCase();
    const v = (c.vigencia || '').toLowerCase();
    return !p.includes('finalizado') && !v.includes('finalizado');
  }).length;

  const contratosVencendoList = contratos.filter(c => {
    const dates = (c.vigencia || '').match(/\d{2}\/\d{2}\/\d{4}/g);
    if (dates && dates.length > 0) {
      const lastDateStr = dates[dates.length - 1];
      const [d, m, y] = lastDateStr.split('/');
      const endDate = new Date(y, m - 1, d);
      const now = new Date();
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Salvando os dias que faltam no objeto para exibir no modal
      c.diasRestantes = diffDays;
      return diffDays >= 0 && diffDays <= 90;
    }
    return false;
  });
  const contratosAVencer = contratosVencendoList.length;

  const eqAgAprovacao = equipamentos.filter(e => {
    const s = norm(e.status);
    return s.includes('aguardando aprovação') || s.includes('ag. aprovação');
  });

  const pendingTasks = tarefas.filter(t => 
    (t.assignee === user?.nome || t.assignee === 'Todos') && !t.completed
  );

  const eqInoperantes = equipamentos.filter(e => {
    const s = norm(e.status);
    return s.includes('inoperante') || s.includes('condenado') || s.includes('manutencao') || s.includes('análise') || s.includes('avaliação');
  });
  
  const eqComPendencia = equipamentos.filter(e => {
    const s = norm(e.status);
    return s.includes('pendencia');
  });
  
  const licitacoesAbertas = licitacoes.filter(l => {
    const s = norm(l.status);
    return !s.includes('conclui') && !s.includes('finaliz');
  }).length;
  
  const eqFuncionando = equipamentos.filter(e => {
    const s = norm(e.status);
    return s !== '' && !eqInoperantes.includes(e) && !eqComPendencia.includes(e);
  });
  
  const equipamentosInoperantes = eqInoperantes.length + eqComPendencia.length;

  const equipmentsByType = equipamentos.reduce((acc, eq) => {
    const type = eq.equipamento || 'Outro';
    if (!acc[type]) acc[type] = { total: 0, inoperante: 0, manutencao: 0, pendencia: 0 };
    acc[type].total++;
    const s = norm(eq.status);
    if (s.includes('inoperante') || s.includes('condenado')) acc[type].inoperante++;
    else if (s.includes('análise') || s.includes('avaliação') || s.includes('manutencao')) acc[type].manutencao++;
    else if (s.includes('pendencia')) acc[type].pendencia++;
    return acc;
  }, {});

  const parseDateBr = (dStr) => {
    return parseDateOutside(dStr);
  };

  const formatDateDisplay = (dStr) => {
    if (!dStr) return '';
    let str = dStr.trim().split(' ')[0];
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
  };

  const atividadesRecentes = [];

  [...groupedOS]
    .sort((a, b) => parseDateBr(b.data_tarefa) - parseDateBr(a.data_tarefa))
    .slice(0, 4)
    .forEach(o => {
      atividadesRecentes.push({
        title: `OS ${o.ordem_servico || 'Nova'} ${o.statusGlobal === 'concluido' ? 'Concluída' : 'Atualizada'}`,
        desc: `A ordem de serviço teve movimentação.`,
        time: o.data_tarefa ? formatDateDisplay(o.data_tarefa) : 'Recente',
        timestamp: parseDateBr(o.data_tarefa) || Date.now(),
        Icon: o.statusGlobal === 'concluido' ? Icons.CheckCircle : Icons.Wrench,
        color: o.statusGlobal === 'concluido' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400',
        bg: o.statusGlobal === 'concluido' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50',
        tab: 'Ordens',
        filterKey: o.ordem_servico
      });
    });

  [...licitacoes]
    .slice(0, 3)
    .forEach((l, i) => {
      atividadesRecentes.push({
        title: `Licitação ${l.modalidade || 'Registrada'}`,
        desc: `Processo: ${l.processo_original || l.stargov || 'N/A'}`,
        time: l.data ? formatDateDisplay(l.data) : 'Recente',
        timestamp: parseDateBr(l.data) || (Date.now() - i * 100000),
        Icon: Icons.Landmark,
        color: 'text-purple-700 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50',
        tab: 'Licitações',
        filterKey: l.processo_original || l.stargov
      });
    });

  [...contratosVencendoList]
    .slice(0, 3)
    .forEach((c, i) => {
      atividadesRecentes.push({
        title: `Atenção: Contrato Vencendo`,
        desc: `${c.numero_contrato || c.processo} vence em ${c.diasRestantes} dias.`,
        time: c.vigencia,
        timestamp: Date.now() + 100000 - i, // Alta prioridade
        Icon: Icons.AlertCircle,
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50',
        tab: 'Contratos',
        filterKey: c.numero_contrato || c.processo
      });
    });

  [...eqInoperantes]
    .slice(0, 3)
    .forEach((e, i) => {
      atividadesRecentes.push({
        title: `Equipamento Inoperante`,
        desc: `${e.equipamento} - S/N: ${e.numero_serie || 'N/A'}`,
        time: 'Alerta',
        timestamp: Date.now() + 50000 - i, // Alta prioridade
        Icon: Icons.Monitor,
        color: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/50',
        tab: 'Equipamentos',
        filterKey: e.numero_serie || e.equipamento
      });
    });

  const financeiroPendentes = financeiro.filter(f => {
    const snf = (f.status_nf || '').toLowerCase();
    const sob = (f.status_ob || '').toLowerCase();
    return snf.includes('pendente') || sob.includes('aguardando');
  });

  [...financeiroPendentes]
    .slice(0, 3)
    .forEach((f, i) => {
      atividadesRecentes.push({
        title: `Pendência Financeira`,
        desc: `NF: ${f.nota_fiscal || '-'} | OB: ${f.ordem_bancaria || '-'} - ${f.objeto || ''}`,
        time: 'Alerta',
        timestamp: Date.now() + 60000 - i, // Altíssima prioridade
        Icon: Icons.Landmark,
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50',
        tab: 'Financeiro',
        filterKey: f.nota_fiscal || f.ordem_bancaria
      });
    });

  atividadesRecentes.sort((a, b) => b.timestamp - a.timestamp);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const generateGeneralReportDraft = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast.error('Por favor, permita pop-ups para gerar o PDF.');

    const dateStr = new Date().toLocaleString('pt-BR');
    
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Geral Operacional - ${dateStr}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #334155; }
            h1 { text-align: center; color: #1e3a8a; font-size: 24px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            p.subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 30px; }
            
            .stats-grid { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 30px; }
            .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; flex: 1; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0f172a; }
            .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 5px; }

            h2 { color: #0f172a; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #f1f5f9; color: #475569; font-weight: bold; padding: 10px; text-align: left; border: 1px solid #cbd5e1; text-transform: uppercase; font-size: 10px; }
            td { padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155; }
            
            @media print {
              @page { margin: 1cm; }
              body { padding: 0; }
              .stat-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório Geral Operacional</h1>
          <p class="subtitle">Gerado em: ${dateStr}</p>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value" style="color: #2563eb;">${osEmAndamento}</div>
              <div class="stat-label">OS em Andamento</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" style="color: #e11d48;">${equipamentosInoperantes}</div>
              <div class="stat-label">Equip. Problema</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" style="color: #d97706;">${contratosAVencer}</div>
              <div class="stat-label">Contratos Vencendo</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" style="color: #059669;">${contratosAtivos}</div>
              <div class="stat-label">Contratos Vigentes</div>
            </div>
          </div>

          <h2>1. Equipamentos Inoperantes ou com Pendência</h2>
          <table>
            <thead>
              <tr>
                <th>Equipamento/Modelo</th>
                <th>Série</th>
                <th>Unidade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${[...eqInoperantes, ...eqComPendencia].map(e => `
                <tr>
                  <td><strong>${e.equipamento || e.categoria}</strong><br/>${e.modelo || '-'}</td>
                  <td>${e.numero_serie || '-'}</td>
                  <td>${e.unidade || '-'}</td>
                  <td style="color: #e11d48; font-weight: bold;">${e.status || '-'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhum equipamento com problema.</td></tr>'}
            </tbody>
          </table>

          <h2>2. Contratos Vencendo (Próximos 90 dias)</h2>
          <table>
            <thead>
              <tr>
                <th>Contrato / Processo</th>
                <th>Objeto</th>
                <th>Vigência</th>
                <th>Dias Restantes</th>
              </tr>
            </thead>
            <tbody>
              ${contratosVencendoList.map(c => `
                <tr>
                  <td><strong>${c.numero_contrato || '-'}</strong><br/><span style="font-size:10px;">Proc: ${c.processo || '-'}</span></td>
                  <td>${c.objeto || '-'}</td>
                  <td>${c.vigencia || '-'}</td>
                  <td style="color: #d97706; font-weight: bold;">${c.diasRestantes} dias</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhum contrato vencendo em breve.</td></tr>'}
            </tbody>
          </table>

          <h2>3. OS em Andamento (Pendentes / Aguardando)</h2>
          <table>
            <thead>
              <tr>
                <th>Ordem de Serviço</th>
                <th>Equipamento</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${groupedOS.filter(o => o.statusGlobal === 'pendente' || o.statusGlobal === 'aguardando').map(o => `
                <tr>
                  <td><strong>${o.ordem_servico || '-'}</strong></td>
                  <td>${o.equipamento || '-'}</td>
                  <td>${o.data_tarefa ? formatDateDisplay(o.data_tarefa) : '-'}</td>
                  <td style="color: #2563eb; font-weight: bold;">${o.statusGlobal.toUpperCase()}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhuma OS em andamento.</td></tr>'}
            </tbody>
          </table>

          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print(); 
                window.onafterprint = function(){ window.close(); };
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-800 dark:to-indigo-900 border border-blue-600 dark:border-blue-500/50 rounded-3xl p-8 shadow-md transition-colors duration-500">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Sistema GAB - ASSESP | PPMA, {user?.nome?.split(' ')[0] || 'Usuário'}!</h2>
            <p className="text-blue-100 dark:text-blue-200 text-sm max-w-2xl">
              Aqui está o resumo operacional das suas unidades hoje. Você tem <strong className="text-white font-semibold">{osEmAndamento} Ordens de Serviço</strong> em andamento e <strong className="text-amber-300 font-semibold">{contratosAVencer} Contrato{contratosAVencer !== 1 ? 's' : ''}</strong> vencendo nos próximos 90 dias.
            </p>
          </div>
          <button 
            onClick={generateGeneralReportDraft}
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl border border-white/20 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Icons.FileText />
            Gerar Relatório Geral
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'OS em Andamento', tab: 'Ordens', value: osEmAndamento.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.Briefcase, trend: 'Ativas', trendColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50' },
          { label: 'Equipamentos Inoperantes', tab: 'Equipamentos', value: equipamentosInoperantes.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-rose-600 dark:text-rose-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.Monitor, trend: 'Atenção', trendColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50' },
          { label: 'Contratos Vigentes', tab: 'Contratos', value: contratosAtivos.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.FileSignature, trend: 'Ativos', trendColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50' },
          { label: 'Licitações Abertas', tab: 'Licitações', value: licitacoesAbertas.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-purple-600 dark:text-purple-400', border: 'border-slate-200 dark:border-slate-800', Icon: Icons.Landmark, trend: 'Em Curso', trendColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800/50' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setActiveTab && setActiveTab(stat.tab)}
            className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden`}
          >
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
        <div className={`col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 transition-all duration-500 flex flex-col ${showAllActivities ? 'max-h-[600px]' : ''}`}>
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Icons.Clock /> Atividades Recentes
            </h3>
            <button 
              onClick={() => setShowAllActivities(!showAllActivities)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
            >
              {showAllActivities ? 'Ver menos' : 'Ver tudo'}
            </button>
          </div>
          <div className={`space-y-6 flex-1 ${showAllActivities ? 'overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
            {atividadesRecentes.length > 0 ? (showAllActivities ? atividadesRecentes : atividadesRecentes.slice(0, 4)).map((activity, i) => (
              <div 
                key={i} 
                onClick={() => {
                  if (!activity.tab || !setActiveTab) return;
                  if (activity.tab === 'Ordens' && activity.filterKey) sessionStorage.setItem('searchOS', activity.filterKey);
                  if (activity.tab === 'Contratos' && activity.filterKey) sessionStorage.setItem('searchContract', activity.filterKey);
                  if (activity.tab === 'Equipamentos' && activity.filterKey) sessionStorage.setItem('searchEquip', activity.filterKey);
                  if (activity.tab === 'Licitações' && activity.filterKey) sessionStorage.setItem('searchLic', activity.filterKey);
                  if (activity.tab === 'Financeiro' && activity.filterKey) sessionStorage.setItem('searchFin', activity.filterKey);
                  setActiveTab(activity.tab);
                }}
                className="flex gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-colors"
              >
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
            )) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade recente encontrada.</p>
            )}
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
            <div onClick={() => setModalState({ isOpen: true, type: 'equipamentos' })} className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3">
                <Icons.Monitor className="text-rose-600 dark:text-rose-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-300">{equipamentosInoperantes} Equipamentos com Problema</p>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">Ação requerida para restabelecer a segurança. Clique para detalhes.</p>
                </div>
              </div>
            </div>
            <div onClick={() => setModalState({ isOpen: true, type: 'contratos' })} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3">
                <Icons.FileSignature className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{contratosAVencer} Contrato{contratosAVencer !== 1 ? 's' : ''} Vencendo</p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">Contratos com vencimento em menos de 90 dias. Clique para detalhes.</p>
                </div>
              </div>
            </div>
            <div onClick={() => setModalState({ isOpen: true, type: 'os' })} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3">
                <Icons.Briefcase className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{osEmAndamento} OS em Andamento</p>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">Ordens aguardando atendimento ou pendentes. Clique para detalhes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* MODAL INTERATIVO */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {modalState.type === 'os' && <><Icons.Briefcase className="text-blue-600" /> Detalhes das OS em Andamento</>}
                {modalState.type === 'contratos' && <><Icons.FileSignature className="text-amber-600" /> Contratos Vencendo</>}
                {modalState.type === 'equipamentos' && <><Icons.Monitor className="text-rose-600" /> Status dos Equipamentos</>}
              </h3>
              <button 
                onClick={() => setModalState({ isOpen: false, type: null })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full cursor-pointer"
              >
                <Icons.X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              
              {/* CONTEÚDO OS */}
              {modalState.type === 'os' && (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setOsFilter(osFilter === 'pendente' ? 'todos' : 'pendente')}
                      className={`p-3 rounded-xl flex-1 border text-center font-bold transition-all ${
                        osFilter === 'pendente' || osFilter === 'todos' 
                          ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500 shadow-md transform scale-[1.02]'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      }`}>
                      {groupedOS.filter(o => o.statusGlobal === 'pendente').length} Pendentes
                    </button>
                    <button 
                      onClick={() => setOsFilter(osFilter === 'aguardando' ? 'todos' : 'aguardando')}
                      className={`p-3 rounded-xl flex-1 border text-center font-bold transition-all ${
                        osFilter === 'aguardando' || osFilter === 'todos'
                          ? 'bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-500 shadow-md transform scale-[1.02]'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                      }`}>
                      {groupedOS.filter(o => o.statusGlobal === 'aguardando').length} Aguardando
                    </button>
                  </div>
                  <div className="space-y-3">
                    {groupedOS
                      .filter(o => o.statusGlobal === 'pendente' || o.statusGlobal === 'aguardando')
                      .filter(o => osFilter === 'todos' || o.statusGlobal === osFilter)
                      .map((o, i) => (
                      <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p 
                              className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={() => {
                                sessionStorage.setItem('searchOS', o.ordem_servico);
                                setModalState({ isOpen: false, type: null });
                                if (setActiveTab) setActiveTab('Ordens');
                              }}
                            >
                              OS {o.ordem_servico || 'Sem número'}
                            </p>
                            {o.tipo_servico && (
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {o.tipo_servico}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{o.equipamento || 'Equipamento não especificado'}</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${o.statusGlobal === 'pendente' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'}`}>
                          {o.statusGlobal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTEÚDO CONTRATOS */}
              {modalState.type === 'contratos' && (
                <div className="space-y-4">
                  {contratosVencendoList.length === 0 ? (
                    <p className="text-center text-slate-500 my-8">Nenhum contrato vencendo.</p>
                  ) : (
                    contratosVencendoList.map((c, i) => (
                      <div key={i} className="p-4 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <p 
                            className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            onClick={() => {
                              sessionStorage.setItem('searchContract', c.numero_contrato || c.processo);
                              setModalState({ isOpen: false, type: null });
                              if (setActiveTab) setActiveTab('Contratos');
                            }}
                          >
                            {c.numero_contrato || c.processo || 'Contrato sem identificação'}
                          </p>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full shrink-0 ml-2">
                            Vence em {c.diasRestantes} {c.diasRestantes === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{c.objeto || 'Objeto não especificado'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 font-mono mt-1">Vigência: {c.vigencia}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* CONTEÚDO EQUIPAMENTOS */}
              {modalState.type === 'equipamentos' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <button 
                      onClick={() => setEquipFilter(equipFilter === 'funcionando' ? 'todos' : 'funcionando')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${equipFilter === 'funcionando' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-[1.02]' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
                    >
                      <p className="text-2xl font-bold">{eqFuncionando.length}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wide mt-1">Funcionando</p>
                    </button>
                    <button 
                      onClick={() => setEquipFilter(equipFilter === 'inoperantes' ? 'todos' : 'inoperantes')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${equipFilter === 'inoperantes' ? 'bg-rose-600 border-rose-600 text-white shadow-md transform scale-[1.02]' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40'}`}
                    >
                      <p className="text-2xl font-bold">{eqInoperantes.length}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wide mt-1">Inoperantes</p>
                    </button>
                    <button 
                      onClick={() => setEquipFilter(equipFilter === 'pendencia' ? 'todos' : 'pendencia')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${equipFilter === 'pendencia' ? 'bg-amber-600 border-amber-600 text-white shadow-md transform scale-[1.02]' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'}`}
                    >
                      <p className="text-2xl font-bold">{eqComPendencia.length}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wide mt-1">Com Pendência</p>
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Lista de Equipamentos</h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {(equipFilter === 'todos' ? equipamentos : equipFilter === 'funcionando' ? eqFuncionando : equipFilter === 'inoperantes' ? eqInoperantes : eqComPendencia)
                        .filter(e => e.numero_serie || e.equipamento)
                        .map((e, i) => (
                        <div key={i} className="flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                          <div className="flex justify-between items-start mb-2">
                            <p 
                              className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={() => {
                                sessionStorage.setItem('searchEquip', e.numero_serie || e.equipamento);
                                setModalState({ isOpen: false, type: null });
                                if (setActiveTab) setActiveTab('Equipamentos');
                              }}
                            >
                              {e.equipamento || 'Equipamento'} {e.modelo ? `- ${e.modelo}` : ''}
                            </p>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${eqInoperantes.includes(e) ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400' : eqComPendencia.includes(e) ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'}`}>
                              {eqInoperantes.includes(e) ? 'Inoperante' : eqComPendencia.includes(e) ? 'Com Pendência' : 'Funcionando'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                            <span>S/N: {e.numero_serie || 'N/A'}</span>
                            <span>{e.unidade || 'Unidade não informada'}</span>
                          </div>
                        </div>
                      ))}
                      {(equipFilter === 'todos' ? equipamentos : equipFilter === 'funcionando' ? eqFuncionando : equipFilter === 'inoperantes' ? eqInoperantes : eqComPendencia).filter(e => e.numero_serie || e.equipamento).length === 0 && (
                        <p className="text-center text-slate-500 text-sm py-4">Nenhum equipamento encontrado para este filtro.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
              <button 
                onClick={() => setModalState({ isOpen: false, type: null })}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
