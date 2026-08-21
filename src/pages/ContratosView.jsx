import { apiFetch, API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { ContratoModal } from '../components/modals/ContratoModal';
import toast from 'react-hot-toast';
import { daysUntil } from '../utils/dateUtils';

export const ContratosView = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // CRUD State
  const initialFormState = {
    numero_contrato: '', vigencia: '', processo: '', tipo: '', recurso_financeiro: '',
    valor_global: '', valor_mensal: '', objeto: '', quantidade: '', execucao: '',
    pendencia: '', prazo_entrega: '', status_licitacao: '', localizacao: '', consulta: '', portaria: ''
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const fetchContratos = () => {
    setIsLoading(true);
    apiFetch(`${API_URL}/api/contratos?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContratos(data);
        } else {
          console.error('API retornou erro:', data);
          setContratos([]);
          toast.error(`Erro do Backend: ${data.error || 'Verifique o terminal do servidor'}`);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar contratos:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchContratos();
    const highlightContract = sessionStorage.getItem('searchContract');
    if (highlightContract) {
      setSearchTerm(highlightContract);
      sessionStorage.removeItem('searchContract');
    }
  }, []);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const filteredContratos = contratos.filter(contract => {
    const searchMatch = !searchTerm ||
      (contract.numero_contrato && contract.numero_contrato.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contract.objeto && contract.objeto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contract.processo && contract.processo.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const cStatus = (contract.status || '').toUpperCase().trim();
    const statusMatch = statusFilter === 'Todos' || cStatus === statusFilter;

    return searchMatch && statusMatch;
  });

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'consulta') {
      let v = value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      if (v.length > 4) {
        value = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      } else if (v.length > 2) {
        value = `${v.slice(0, 2)}/${v.slice(2)}`;
      } else {
        value = v;
      }
    }
    
    if (name === 'valor_global' || name === 'valor_mensal') {
      let v = value.replace(/\D/g, '');
      if (v === '') {
        value = '';
      } else {
        v = (parseInt(v, 10) / 100).toFixed(2);
        value = 'R$ ' + v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/contratos/${editingId}` : `${API_URL}/api/contratos`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const savedContrato = await res.json();
        if (editingId) {
          setContratos(prev => prev.map(c => c.id === editingId ? savedContrato : c));
        } else {
          setContratos(prev => [savedContrato, ...prev]);
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialFormState);
      } else {
        toast.error('Erro ao salvar contrato. Verifique os campos.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro na requisição');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja apagar este contrato?')) return;
    try {
      const res = await apiFetch(`${API_URL}/api/contratos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContratos(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir');
    }
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (contract, e) => {
    e.stopPropagation();
    setFormData(contract);
    setEditingId(contract.id);
    setIsModalOpen(true);
  };

  // KPI Calculations
  const parseCurrency = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const clean = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const totalContratos = filteredContratos.length;

  const totalValue = filteredContratos.reduce((sum, c) => sum + parseCurrency(c.valor_global), 0);
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(totalValue);

  const contratosAtivos = filteredContratos.filter(c => {
    const p = (c.pendencia || '').toLowerCase();
    const v = (c.vigencia || '').toLowerCase();
    return !p.includes('finalizado') && !v.includes('finalizado');
  }).length;

  const aVencer90dias = filteredContratos.filter(c => {
    const dates = (c.vigencia || '').match(/\d{2}\/\d{2}\/\d{4}/g);
    if (dates && dates.length > 0) {
      const lastDateStr = dates[dates.length - 1];
      const diffDays = daysUntil(lastDateStr);
      return diffDays !== null && diffDays >= 0 && diffDays <= 90;
    }
    return false;
  }).length;


  return (
    <div className="space-y-8">
      {/* Metrics for Contracts */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de Contratos', value: totalContratos.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Valor Global Total', value: formattedTotalValue, color: 'bg-white dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Contratos Ativos', value: contratosAtivos.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'A Vencer (90 dias)', value: aVencer90dias.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-amber-600 dark:text-amber-400', border: 'border-slate-200 dark:border-slate-800' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 transition-transform duration-300 cursor-default group`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors duration-500">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 transition-colors duration-500 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.FileSignature /> Gestão de Contratos
          </h2>
          <div className="flex gap-3 items-center">
            
            {/* Status Filter Cards */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shadow-inner h-10">
              <button
                onClick={() => setStatusFilter('Todos')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === 'Todos' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                TODOS
              </button>
              <button
                onClick={() => setStatusFilter('ATIVO')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === 'ATIVO' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
              >
                ATIVOS
              </button>
              <button
                onClick={() => setStatusFilter('FINALIZADO')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === 'FINALIZADO' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'}`}
              >
                FINALIZADOS
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Busca Avançada (Contrato, Objeto e Processo Mãe)"
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Limpar Busca"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={fetchContratos}
              className="px-4 h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              title="Atualizar Dados"
            >
              <Icons.RefreshCw className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <button
              onClick={openNewModal}
              className="px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Icons.Plus /> Novo Contrato
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
                <th className="pl-4 pr-2 py-4 font-medium w-8"></th>
                <th className="px-6 py-4 font-medium w-1/4">Contrato</th>
                <th className="px-6 py-4 font-medium w-1/4">Objeto</th>
                <th className="px-6 py-4 font-medium w-1/4">Processo Mãe</th>
                <th className="px-6 py-4 font-medium">Vigência</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm transition-colors duration-500">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Carregando contratos do banco de dados...
                  </td>
                </tr>
              ) : filteredContratos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              ) : (
                filteredContratos.map((contract) => {
                  const rowId = contract.id || contract.numero_contrato;
                  const isExpanded = expandedRow === rowId;

                  return (
                    <React.Fragment key={rowId}>
                      <tr
                        onClick={() => toggleRow(rowId)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                      >
                        <td className="pl-4 pr-2 py-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                          {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">{contract.numero_contrato || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate" title={contract.objeto}>{contract.objeto || '-'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{contract.tipo || '-'} • {contract.quantidade || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{contract.processo || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{contract.vigencia || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => openEditModal(contract, e)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={(e) => handleDelete(contract.id, e)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Content Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-500">
                          <td colSpan="6" className="p-0 border-b border-slate-200 dark:border-slate-800">
                            <div className="pl-12 pr-8 py-8">
                              <div className="flex flex-wrap items-stretch justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                {/* Column 1 */}
                                <div className="flex flex-col gap-4 flex-1">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Recurso Financeiro</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{contract.recurso_financeiro || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Tipo / Quantidade</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{contract.tipo || '-'} ({contract.quantidade || '-'})</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Localização</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Icons.MapMap /> {contract.localizacao || '-'}</p>
                                  </div>
                                </div>

                                <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                                {/* Column 2 */}
                                <div className="flex flex-col gap-4 flex-1">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Valor Global</p>
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{contract.valor_global || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Valor Mensal</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{contract.valor_mensal || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Última Consulta</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{contract.consulta || '-'}</p>
                                  </div>
                                </div>

                                <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                                {/* Column 3 */}
                                <div className="flex flex-col gap-4 flex-1">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Execução</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 uppercase">{contract.execucao || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Pendência (Saldo)</p>
                                    <p className="text-sm text-rose-600 dark:text-rose-400 font-bold">{contract.pendencia || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Status (Licitação)</p>
                                    <div className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium mt-1">
                                      {contract.status_licitacao || '-'}
                                    </div>
                                  </div>
                                </div>

                                <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                                {/* Column 4 */}
                                <div className="flex flex-col gap-4 flex-1">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Prazo de Entrega (Prev)</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Icons.Clock /> {contract.prazo_entrega || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Portaria</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {contract.portaria ? contract.portaria.charAt(0) : '-'}
                                      </div>
                                      <p className="text-sm text-slate-800 dark:text-slate-200">{contract.portaria || '-'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Full width object text */}
                              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">Objeto (Descrição Completa)</p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors min-h-[80px]">
                                    {contract.objeto || '-'}
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">Status do Processo (Completo)</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                      {contract.status_licitacao || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">Vigência (Completa)</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                      {contract.vigencia || '-'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <ContratoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        formData={formData}
        handleInputChange={handleInputChange}
        editingId={editingId}
      />
    </div>
  );
};