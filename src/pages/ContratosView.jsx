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
          { label: 'Total de Contratos', value: '18', color: 'bg-white dark:bg-slate-900', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Valor Global Total', value: 'R$ 8.5M', color: 'bg-white dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Contratos Ativos', value: '12', color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'A Vencer (90 dias)', value: '2', color: 'bg-white dark:bg-slate-900', text: 'text-amber-600 dark:text-amber-400', border: 'border-slate-200 dark:border-slate-800' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 transition-transform duration-300 cursor-default group`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-500">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 transition-colors duration-500">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.FileSignature /> Gestão de Contratos
          </h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm cursor-pointer">Filtros</button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
              <Icons.Plus /> Novo Contrato
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Contrato</th>
                <th className="px-6 py-4 font-medium">Objeto</th>
                <th className="px-6 py-4 font-medium">Vigência</th>
                <th className="px-6 py-4 font-medium">Status (Licitação)</th>
                <th className="px-6 py-4 font-medium">Responsável</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm transition-colors duration-500">
              {DUMMY_CONTRACTS.map((contract) => {
                const isExpanded = expandedRow === contract.id;

                return (
                  <React.Fragment key={contract.id}>
                    <tr 
                      onClick={() => toggleRow(contract.id)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                    >
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                        {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">{contract.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate" title={contract.objeto}>{contract.objeto}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{contract.tipo} • {contract.quantidade}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5"><Icons.Calendar /> {contract.vigencia}</td>
                      <td className="px-6 py-4">
                         <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors">{contract.statusLicitacao}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Icons.User /> {contract.responsavel}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                          <Icons.MoreVertical />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Content Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-500">
                        <td colSpan="7" className="p-0 border-b border-slate-200 dark:border-slate-800">
                          <div className="px-16 py-8">
                            <div className="grid grid-cols-4 gap-x-8 gap-y-6">
                              {/* Column 1 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Processo Mãe</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 font-mono">{contract.processoMae}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Tipo / Quantidade</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{contract.tipo} ({contract.quantidade})</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Localização</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Icons.MapMap /> {contract.localizacao}</p>
                                </div>
                              </div>
                              
                              {/* Column 2 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Valor Global</p>
                                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{contract.valorGlobal}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Valor Mensal</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{contract.valorMensal}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Recurso Financeiro</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200">{contract.recursoFinanceiro}</p>
                                </div>
                              </div>

                              {/* Column 3 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Execução</p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-600 rounded-full" style={{ width: contract.execucao }}></div>
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-mono">{contract.execucao}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Pendência (Saldo)</p>
                                  <p className="text-sm text-rose-600 dark:text-rose-400 font-bold">{contract.pendencia}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Última Consulta</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{contract.ultimaConsulta}</p>
                                </div>
                              </div>

                              {/* Column 4 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Prazo de Entrega (Prev)</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Icons.Clock /> {contract.prazoEntrega}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Responsável</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                                      {contract.responsavel && contract.responsavel.charAt(0)}
                                    </div>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{contract.responsavel}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Full width object text */}
                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">Objeto (Descrição Completa)</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
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