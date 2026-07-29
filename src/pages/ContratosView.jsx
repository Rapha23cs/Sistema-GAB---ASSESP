import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { DUMMY_CONTRACTS } from '../data/mockData';

export const ContratosView = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="space-y-8">
      {/* Metrics for Contracts */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de Contratos', value: '18', color: 'bg-white', text: 'text-slate-800', border: 'border-slate-200' },
          { label: 'Valor Global Total', value: 'R$ 8.5M', color: 'bg-white', text: 'text-blue-600', border: 'border-slate-200' },
          { label: 'Contratos Ativos', value: '12', color: 'bg-white', text: 'text-emerald-600', border: 'border-slate-200' },
          { label: 'A Vencer (90 dias)', value: '2', color: 'bg-white', text: 'text-amber-600', border: 'border-slate-200' },
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
            <Icons.FileSignature /> Gestão de Contratos
          </h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-300 shadow-sm cursor-pointer">Filtros</button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
              <Icons.Plus /> Novo Contrato
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Contrato</th>
                <th className="px-6 py-4 font-medium">Objeto</th>
                <th className="px-6 py-4 font-medium">Vigência</th>
                <th className="px-6 py-4 font-medium">Status (Licitação)</th>
                <th className="px-6 py-4 font-medium">Responsável</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {DUMMY_CONTRACTS.map((contract) => {
                const isExpanded = expandedRow === contract.id;

                return (
                  <React.Fragment key={contract.id}>
                    <tr 
                      onClick={() => toggleRow(contract.id)}
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                        {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-700 whitespace-nowrap">{contract.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 max-w-xs truncate" title={contract.objeto}>{contract.objeto}</div>
                        <div className="text-xs text-slate-500 mt-1">{contract.tipo} • {contract.quantidade}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap flex items-center gap-1.5"><Icons.Calendar /> {contract.vigencia}</td>
                      <td className="px-6 py-4">
                         <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">{contract.statusLicitacao}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Icons.User /> {contract.responsavel}
                        </div>
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
                        <td colSpan="7" className="p-0 border-b border-slate-200">
                          <div className="px-16 py-8">
                            <div className="grid grid-cols-4 gap-x-8 gap-y-6">
                              {/* Column 1 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Processo Mãe</p>
                                  <p className="text-sm text-slate-800 font-mono">{contract.processoMae}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tipo / Quantidade</p>
                                  <p className="text-sm text-slate-800">{contract.tipo} ({contract.quantidade})</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Localização</p>
                                  <p className="text-sm text-slate-800 flex items-center gap-1.5"><Icons.MapMap /> {contract.localizacao}</p>
                                </div>
                              </div>
                              
                              {/* Column 2 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Valor Global</p>
                                  <p className="text-sm font-bold text-emerald-700">{contract.valorGlobal}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Valor Mensal</p>
                                  <p className="text-sm text-slate-800">{contract.valorMensal}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Recurso Financeiro</p>
                                  <p className="text-sm text-slate-800">{contract.recursoFinanceiro}</p>
                                </div>
                              </div>

                              {/* Column 3 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Execução</p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-600 rounded-full" style={{ width: contract.execucao }}></div>
                                    </div>
                                    <span className="text-sm text-slate-700 font-mono">{contract.execucao}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Pendência (Saldo)</p>
                                  <p className="text-sm text-rose-600 font-bold">{contract.pendencia}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Última Consulta</p>
                                  <p className="text-sm text-slate-600">{contract.ultimaConsulta}</p>
                                </div>
                              </div>

                              {/* Column 4 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Prazo de Entrega (Prev)</p>
                                  <p className="text-sm text-slate-800 flex items-center gap-1.5"><Icons.Clock /> {contract.prazoEntrega}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Responsável</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 border border-slate-300">
                                      {contract.responsavel && contract.responsavel.charAt(0)}
                                    </div>
                                    <p className="text-sm text-slate-800">{contract.responsavel}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Full width object text */}
                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Objeto (Descrição Completa)</p>
                                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  {contract.objeto}
                                </p>
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