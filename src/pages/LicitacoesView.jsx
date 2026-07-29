import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { LicitacaoStatusBadge } from '../components/Badges';
import { DUMMY_LICITACOES } from '../data/mockData';

export const LicitacoesView = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="space-y-8">
      {/* Metrics for Licitações */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de Processos', value: '42', color: 'bg-white', text: 'text-slate-800', border: 'border-slate-200' },
          { label: 'Em Andamento', value: '15', color: 'bg-white', text: 'text-blue-600', border: 'border-slate-200' },
          { label: 'Homologadas', value: '24', color: 'bg-white', text: 'text-emerald-600', border: 'border-slate-200' },
          { label: 'Suspensas/Desertas', value: '3', color: 'bg-white', text: 'text-amber-600', border: 'border-slate-200' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 transition-transform duration-300 cursor-default group`}>
            <p className="text-sm font-medium text-slate-500 mb-2 group-hover:text-slate-700 transition-colors">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Icons.Landmark /> Painel de Licitações
          </h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-300 shadow-sm cursor-pointer">Filtros</button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
              <Icons.Plus /> Nova Licitação
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Processo Principal</th>
                <th className="px-6 py-4 font-medium">Objeto</th>
                <th className="px-6 py-4 font-medium">Modalidade</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {DUMMY_LICITACOES.map((lic) => {
                const isExpanded = expandedRow === lic.id;

                return (
                  <React.Fragment key={lic.id}>
                    <tr 
                      onClick={() => toggleRow(lic.id)}
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                        {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icons.FileText />
                          {lic.processo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 max-w-xs truncate" title={lic.objeto}>{lic.objeto}</div>
                        <div className="text-xs text-slate-500 mt-1">Qtd: {lic.quantidade}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{lic.modalidade}</td>
                      <td className="px-6 py-4">
                         <LicitacaoStatusBadge status={lic.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                          <Icons.MoreVertical />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Content Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="6" className="p-0 border-b border-slate-200">
                          <div className="px-16 py-8">
                            <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                              {/* Column 1 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Processos Relacionados</p>
                                  <div className="text-sm text-slate-800 font-mono space-y-1">
                                    <p>Aut: {lic.autorizacao}</p>
                                    <p>Memo: {lic.memoAbertura}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Localização</p>
                                  <p className="text-sm text-slate-800 flex items-center gap-1.5"><Icons.MapMap /> {lic.localizacao}</p>
                                </div>
                              </div>
                              
                              {/* Column 2 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Fonte de Custeio</p>
                                  <p className="text-sm text-slate-800">{lic.fonteCusteio}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Valor Contratual Previsto</p>
                                  <p className="text-sm font-bold text-emerald-700">{lic.valorPrevisto}</p>
                                </div>
                              </div>

                              {/* Column 3 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Data / Prazo</p>
                                  <p className="text-sm text-slate-800 flex items-center gap-1.5"><Icons.Calendar /> {lic.data}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Consultor</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 border border-slate-300">
                                      {lic.consultor && lic.consultor.charAt(0)}
                                    </div>
                                    <p className="text-sm text-slate-800">{lic.consultor}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
