import { apiFetch } from '../config';
import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { FinanceiroModal } from '../components/modals/FinanceiroModal';
import toast from 'react-hot-toast';

export const FinanceiroView = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [financeiroData, setFinanceiroData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContratos, setSelectedContratos] = useState([]);
  const [statusOBFilter, setStatusOBFilter] = useState('Todos');
  const [isContratoDropdownOpen, setIsContratoDropdownOpen] = useState(false);

  const toggleContrato = (c) => {
    if (selectedContratos.includes(c)) setSelectedContratos(prev => prev.filter(x => x !== c));
    else setSelectedContratos(prev => [...prev, c]);
  };

  // CRUD State
  const initialFormState = {
    contrato: '', objeto: '', sei: '', mes: '',
    nota_fiscal: '', valor_nf: '', status_nf: '', fonte_custeio: '',
    ordem_bancaria: '', valor_ob: '', data_pagamento: '', status_ob: ''
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    setIsLoading(true);
    apiFetch(`${API_URL}/api/financeiro?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFinanceiroData(data);
        else setFinanceiroData([]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar financeiro:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const highlightFin = sessionStorage.getItem('searchFin');
    if (highlightFin) {
      setSearchTerm(highlightFin);
      sessionStorage.removeItem('searchFin');
    }
  }, []);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'data_pagamento') {
      let v = value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      if (v.length > 4) value = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      else if (v.length > 2) value = `${v.slice(0, 2)}/${v.slice(2)}`;
      else value = v;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      contrato: item.contrato || '',
      objeto: item.objeto || '',
      sei: item.sei || '',
      mes: item.mes || '',
      nota_fiscal: item.nota_fiscal || '',
      valor_nf: item.valor_nf || '',
      status_nf: item.status_nf || '',
      fonte_custeio: item.fonte_custeio || '',
      ordem_bancaria: item.ordem_bancaria || '',
      valor_ob: item.valor_ob || '',
      data_pagamento: item.data_pagamento || '',
      status_ob: item.status_ob || ''
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/financeiro/${editingId}` : `${API_URL}/api/financeiro`;
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Erro ao salvar');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id, contrato) => {
    if (!window.confirm('Tem certeza que deseja apagar este registro?')) return;
    try {
      const res = await apiFetch(`${API_URL}/api/financeiro/${id}?contrato=${encodeURIComponent(contrato)}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  // Filtros
  const filteredData = financeiroData.filter(item => {
    const searchStr = `${item.objeto} ${item.sei} ${item.nota_fiscal} ${item.ordem_bancaria}`.toLowerCase();
    const matchSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchContrato = selectedContratos.length === 0 || selectedContratos.includes(item.contrato);
    const matchStatus = statusOBFilter === 'Todos' || (item.status_ob || '').toLowerCase().includes(statusOBFilter.toLowerCase());

    return matchSearch && matchContrato && matchStatus;
  });

  // KPIs
  const parseCurrency = (str) => {
    if (!str) return 0;
    const num = String(str).replace(/R\$ /g, '').replace(/\./g, '').replace(',', '.');
    return isNaN(parseFloat(num)) ? 0 : parseFloat(num);
  };

  const totalValorNF = filteredData.reduce((acc, curr) => acc + parseCurrency(curr.valor_nf), 0);
  const totalValorOB = filteredData.reduce((acc, curr) => acc + parseCurrency(curr.valor_ob), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Registros</p>
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{filteredData.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Valor Total NF</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValorNF)}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Valor Total OB</p>
          <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValorOB)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-900 transition-colors duration-500">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 whitespace-nowrap">
            <Icons.Landmark /> Controle Financeiro
          </h2>
          
          <div className="flex flex-col md:flex-row flex-wrap gap-3 items-start md:items-center w-full xl:w-auto">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {['Todos', 'Pago', 'Aguardando'].map(status => (
              <button
                key={status}
                onClick={() => setStatusOBFilter(status)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  statusOBFilter === status 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsContratoDropdownOpen(!isContratoDropdownOpen)}
                className="px-4 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                <span className="truncate max-w-[120px]">
                  {selectedContratos.length === 0 ? 'Todos os Contratos' : `${selectedContratos.length} Contrato(s)`}
                </span>
                <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isContratoDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isContratoDropdownOpen && (
                <div className="absolute top-12 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedContratos.length === 0} 
                        onChange={() => setSelectedContratos([])}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Todos os Contratos</span>
                    </label>
                  </div>
                  {Array.from(new Set(financeiroData.map(item => item.contrato).filter(Boolean))).sort().map(c => (
                    <div key={c} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedContratos.includes(c)} 
                          onChange={() => toggleContrato(c)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{c}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar objeto, sei, nf, ob..."
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 md:w-72 h-10 transition-all focus:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={fetchData}
              className="px-4 h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              title="Atualizar Dados"
            >
              <Icons.RefreshCw className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <button
              onClick={openNewModal}
              className="px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Icons.Plus /> Novo Registro
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Contrato / Mês</th>
                <th className="px-6 py-4 font-medium">Objeto</th>
                <th className="px-6 py-4 font-medium">Nota Fiscal / SEI</th>
                <th className="px-6 py-4 font-medium">Valor NF</th>
                <th className="px-6 py-4 font-medium">Status NF</th>
                <th className="px-6 py-4 font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Carregando dados...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum registro financeiro encontrado.</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <React.Fragment key={item.id || idx}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                          className="text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Icons.ChevronDown className={`transform transition-transform ${expandedRow === item.id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.contrato || '-'}</span>
                          {item.mes && <span className="text-xs text-slate-500 dark:text-slate-400">Mês: {item.mes}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={item.objeto}>
                        {item.objeto || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">NF: {item.nota_fiscal || '-'}</span>
                          {item.sei && <span className="text-xs text-slate-500 dark:text-slate-400">SEI: {item.sei}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {item.valor_nf || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (item.status_nf || '').toLowerCase().includes('pendente')
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            : (item.status_nf || '').toLowerCase().includes('autorizado')
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.status_nf || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
                            <Icons.Edit />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.contrato)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                            <Icons.Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === item.id && (
                      <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                        <td colSpan="7" className="px-14 py-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="grid grid-cols-3 gap-8">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fonte de Custeio</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.fonte_custeio || '-'}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ordem Bancária (OB)</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.ordem_bancaria || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status OB</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.status_ob || '-'}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Valor OB</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.valor_ob || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Data de Pagamento</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.data_pagamento || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      <FinanceiroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        editingId={editingId}
      />
    </div>
  );
};
