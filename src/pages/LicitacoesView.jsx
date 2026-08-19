import { apiFetch } from '../config';
import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { LicitacoesModal } from '../components/modals/LicitacoesModal';
import toast from 'react-hot-toast';

export const LicitacoesView = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [licitacoes, setLicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('Todas');
  const [tipoObjetoFilter, setTipoObjetoFilter] = useState('Todos');

  // CRUD State
  const initialFormState = {
    processo_original: '', processo_autorizacao: '', stargov: '', memo: '',
    modalidade: '', custeio: '', valor_previsto: '', objeto: '', quantidade: '',
    status: '', localizacao: '', data: '', tipo_objeto: ''
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    setIsLoading(true);
    apiFetch(`${API_URL}/api/licitacoes?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLicitacoes(data);
        else setLicitacoes([]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar licitacoes:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const highlightLic = sessionStorage.getItem('searchLic');
    if (highlightLic) {
      setSearchTerm(highlightLic);
      sessionStorage.removeItem('searchLic');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      processo_original: item.processo_original || '',
      processo_autorizacao: item.processo_autorizacao || '',
      stargov: item.stargov || '',
      memo: item.memo || '',
      modalidade: item.modalidade || '',
      custeio: item.custeio || '',
      valor_previsto: item.valor_previsto || '',
      objeto: item.objeto || '',
      quantidade: item.quantidade || '',
      status: item.status || '',
      localizacao: item.localizacao || '',
      data: item.data || '',
      tipo_objeto: item.tipo_objeto || ''
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/licitacoes/${editingId}` : `${API_URL}/api/licitacoes`;
      
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

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja apagar este registro?')) return;
    try {
      const res = await apiFetch(`${API_URL}/api/licitacoes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  // Filtros
  const filteredData = licitacoes.filter(item => {
    const matchSearch = (item.processo_original || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.objeto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.stargov || '').toLowerCase().includes(searchTerm.toLowerCase());
                        
    const matchModalidade = modalidadeFilter === 'Todas' || 
                            (item.modalidade || '').toUpperCase().includes(modalidadeFilter.toUpperCase());

    const matchTipoObjeto = tipoObjetoFilter === 'Todos' ||
                            (item.tipo_objeto || '').toUpperCase() === tipoObjetoFilter.toUpperCase();

    return matchSearch && matchModalidade && matchTipoObjeto;
  });

  // KPIs
  const parseCurrency = (str) => {
    if (!str) return 0;
    const num = String(str).replace(/R\$ /g, '').replace(/\./g, '').replace(',', '.');
    return isNaN(parseFloat(num)) ? 0 : parseFloat(num);
  };

  const totalValorPrevisto = filteredData.reduce((acc, curr) => acc + parseCurrency(curr.valor_previsto), 0);
  const totalPregao = filteredData.filter(i => (i.modalidade || '').toUpperCase().includes('PREGÃO')).length;
  const totalInex = filteredData.filter(i => (i.modalidade || '').toUpperCase().includes('INEXIGIBILIDADE')).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Total de Processos</p>
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{filteredData.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Valor Total Previsto</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValorPrevisto)}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Pregões</p>
          <p className="text-4xl font-bold text-indigo-500 dark:text-indigo-400">{totalPregao}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-default hover:-translate-y-1 transition-transform duration-300 group">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 transition-colors">Inexigibilidades</p>
          <p className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">{totalInex}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-900 transition-colors duration-500">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 whitespace-nowrap">
            <Icons.Landmark /> Processos Licitatórios
          </h2>
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {/* Status Filter Cards */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shadow-inner h-10">
              <button
                onClick={() => setTipoObjetoFilter('Todos')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${tipoObjetoFilter === 'Todos' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                TODOS
              </button>
              <button
                onClick={() => setTipoObjetoFilter('Aquisição')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${tipoObjetoFilter === 'Aquisição' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                AQUISIÇÃO
              </button>
              <button
                onClick={() => setTipoObjetoFilter('Serviço')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${tipoObjetoFilter === 'Serviço' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
              >
                SERVIÇO
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar processo, objeto, stargov..."
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 md:w-72 h-10 transition-all focus:w-80"
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

            <select
              value={modalidadeFilter}
              onChange={(e) => setModalidadeFilter(e.target.value)}
              className="px-4 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200"
            >
              <option value="Todas">Todas Modalidades</option>
              <option value="PREGÃO">Pregão</option>
              <option value="INEXIGIBILIDADE">Inexigibilidade</option>
            </select>

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
              <Icons.Plus /> Novo Processo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">Processo SEI</th>
                <th className="px-6 py-4 font-medium">Objeto</th>
                <th className="px-6 py-4 font-medium">Modalidade</th>
                <th className="px-6 py-4 font-medium">Valor Previsto</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Carregando dados...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum processo encontrado.</td></tr>
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
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.processo_original || '-'}</span>
                          {item.stargov && <span className="text-xs text-slate-500 dark:text-slate-400">StarGov: {item.stargov}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={item.objeto}>
                        {item.objeto || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(item.modalidade || '').toUpperCase().includes('PREGÃO') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          {item.modalidade || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {item.valor_previsto || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.status || 'Não informado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
                            <Icons.Edit />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                            <Icons.Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === item.id && (
                      <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                        <td colSpan="7" className="px-14 py-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex flex-wrap items-stretch justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                            <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Processos de Autorização (Governo)</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.processo_autorizacao || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Memo de Abertura</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.memo || '-'}</p>
                              </div>
                            </div>
                            
                            <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                            
                            <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Custeio/Recurso</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.custeio || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Quantidade</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.quantidade || '-'}</p>
                              </div>
                            </div>
                            
                            <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                            
                            <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Localização</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.localizacao || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Data</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{item.data || '-'}</p>
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

      <LicitacoesModal
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
