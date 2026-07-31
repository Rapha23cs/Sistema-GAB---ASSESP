import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { ContractBadge, EqStatusBadge } from '../components/Badges';
import { DUMMY_EQUIPMENTS, DUMMY_CONTRACTS, DUMMY_ORDERS } from '../data/mockData';

export const EquipmentsView = () => {
  const [filterType, setFilterType] = useState('Todos');
  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEqData, setNewEqData] = useState({
    contrato: '',
    tipo: 'Esteira Raio - X',
    numero_serie: '',
    modelo: '',
    cobertura_contrato: 'com_contrato',
    os_atual: '',
    sei: '',
    status: 'operante',
    data_garantia: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEqData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEquipment = () => {
    alert('Equipamento adicionado com sucesso! (Simulação)');
    setIsModalOpen(false);
  };

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
          <div className="flex items-center gap-4">
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
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <Icons.Plus /> Novo Equipamento
            </button>
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

      {/* Modal Novo Equipamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icons.Plus /> Cadastrar Novo Equipamento
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tipo de Equipamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Equipamento</label>
                  <select name="tipo" value={newEqData.tipo} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="Esteira Raio - X">Esteira Raio - X</option>
                    <option value="Bodyscann">Bodyscan</option>
                    <option value="Pórtico">Pórtico</option>
                  </select>
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
                  <input name="modelo" value={newEqData.modelo} onChange={handleInputChange} type="text" placeholder="Ex: Rapiscan 620XR" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

                {/* Número de Série */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Série</label>
                  <input name="numero_serie" value={newEqData.numero_serie} onChange={handleInputChange} type="text" placeholder="Ex: SN-XR-88902" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

                {/* Processo SEI */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Processo SEI</label>
                  <input name="sei" value={newEqData.sei} onChange={handleInputChange} type="text" placeholder="Ex: 0000.000000.00000" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 font-mono" />
                </div>

                {/* Contrato Vinculado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contrato Vinculado</label>
                  <select name="contrato" value={newEqData.contrato} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="">Selecione um contrato...</option>
                    {DUMMY_CONTRACTS.map(c => (
                      <option key={c.id} value={c.id}>{c.id}</option>
                    ))}
                  </select>
                </div>

                {/* Cobertura de Contrato */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cobertura de Contrato</label>
                  <select name="cobertura_contrato" value={newEqData.cobertura_contrato} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="com_contrato">Com Contrato</option>
                    <option value="sem_contrato">Sem Contrato</option>
                    <option value="garantia">Na Garantia</option>
                  </select>
                </div>

                {/* Ordem de Serviço Atual */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ordem de Serviço Atual (Opcional)</label>
                  <select name="os_atual" value={newEqData.os_atual} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="">Selecione uma OS...</option>
                    {DUMMY_ORDERS.map(os => (
                      <option key={os.id} value={os.numero_os}>{os.numero_os} - {os.status}</option>
                    ))}
                  </select>
                </div>

                {/* Status de Funcionamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Operacional</label>
                  <select name="status" value={newEqData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="operante">Operante</option>
                    <option value="inoperante">Inoperante</option>
                    <option value="em_manutencao">Em Manutenção</option>
                  </select>
                </div>

                {/* Data de Garantia */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Garantia</label>
                  <input name="data_garantia" value={newEqData.data_garantia} onChange={handleInputChange} type="date" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveEquipment} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
                <Icons.CheckSquare /> Salvar Equipamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};