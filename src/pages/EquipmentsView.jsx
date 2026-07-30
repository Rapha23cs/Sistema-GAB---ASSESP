import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { ContractBadge, EqStatusBadge } from '../components/Badges';
import { DUMMY_EQUIPMENTS } from '../data/mockData';

export const EquipmentsView = () => {
  const [filterType, setFilterType] = useState('Todos');
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const filteredEquipments = DUMMY_EQUIPMENTS.filter(eq => {
    if (filterType === 'Todos') return true;
    return eq.type === filterType;
  });

  return (
    <div className="space-y-8">
      {/* Metrics for Equipments */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de Equipamentos', value: '45', color: 'bg-white dark:bg-slate-900', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Operantes', value: '38', color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Em Manutenção', value: '5', color: 'bg-white dark:bg-slate-900', text: 'text-amber-600 dark:text-amber-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Inoperantes', value: '2', color: 'bg-white dark:bg-slate-900', text: 'text-rose-600 dark:text-rose-400', border: 'border-slate-200 dark:border-slate-800' },
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
            <Icons.Monitor /> Inventário de Equipamentos
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Filtrar:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gab-gold/50 cursor-pointer transition-colors"
            >
              <option value="Todos">Todos</option>
              <option value="Esteira Raio - X">Esteira Raio-X</option>
              <option value="Bodyscann">Bodyscan</option>
              <option value="Pórtico">Pórtico</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Equipamento</th>
                <th className="px-6 py-4 font-medium">Unidade</th>
                <th className="px-6 py-4 font-medium">Cobertura de Contrato</th>
                <th className="px-6 py-4 font-medium">OS Atual</th>
                <th className="px-6 py-4 font-medium">Status Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm transition-colors duration-500">
              {filteredEquipments.length > 0 ? (
                filteredEquipments.map((eq) => {
                  const isExpanded = expandedRow === eq.id;

                  return (
                    <React.Fragment key={eq.id}>
                      <tr 
                        onClick={() => toggleRow(eq.id)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                      >
                        <td className="px-6 py-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                          {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Icons.Server /> {eq.type}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{eq.serial} • {eq.model}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5"><Icons.MapPin /> {eq.unit}</td>
                        <td className="px-6 py-4"><ContractBadge status={eq.contract} /></td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{eq.currentOS || '-'}</td>
                        <td className="px-6 py-4"><EqStatusBadge status={eq.status} /></td>
                      </tr>

                      {/* Expanded Content Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-500">
                          <td colSpan="7" className="p-0 border-b border-slate-200 dark:border-slate-800">
                            <div className="px-16 py-8">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Contrato Vinculado */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                                    <Icons.FileSignature className="w-4 h-4" /> Contrato Vinculado
                                  </p>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {eq.contrato_vinculado}
                                  </p>
                                </div>
                                {/* SEI */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                                    <Icons.FileText className="w-4 h-4" /> Processo SEI
                                  </p>
                                  <p className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                                    {eq.sei}
                                  </p>
                                </div>
                                {/* Informações/Pendências */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                                    <Icons.AlertCircle className="w-4 h-4" /> Informações / Pendências
                                  </p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {eq.informacoes_pendencias}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhum equipamento encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};