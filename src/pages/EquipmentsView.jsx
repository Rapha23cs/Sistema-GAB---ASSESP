import { apiFetch } from '../config';
import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { ContractBadge, EqStatusBadge } from '../components/Badges';
import { DUMMY_EQUIPMENTS, DUMMY_CONTRACTS, DUMMY_ORDERS } from '../data/mockData';

export const EquipmentsView = () => {
  const [filterTypes, setFilterTypes] = useState([]);
  const [isTypesOpen, setIsTypesOpen] = useState(false);
  const [filterContracts, setFilterContracts] = useState([]);
  const [isContractsOpen, setIsContractsOpen] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [isStatusesOpen, setIsStatusesOpen] = useState(false);
  const [filterModelos, setFilterModelos] = useState([]);
  const [isModelosOpen, setIsModelosOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [equipamentos, setEquipamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contratosDb, setContratosDb] = useState([]);

  const fetchData = () => {
    setIsLoading(true);
    apiFetch(`${API_URL}/api/contratos`)
      .then(res => res.json())
      .then(data => setContratosDb(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
      
    apiFetch(`${API_URL}/api/equipamentos`)
      .then(res => res.json())
      .then(data => {
        setEquipamentos(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const highlightEquip = sessionStorage.getItem('searchEquip');
    if (highlightEquip) {
      setSearchTerm(highlightEquip);
      setShowFilters(true);
      sessionStorage.removeItem('searchEquip');
    }
  }, []);

  const clearFilters = () => {
    setFilterTypes([]);
    setFilterContracts([]);
    setFilterStatuses([]);
    setFilterModelos([]);
    setSearchTerm('');
  };

  const initialFormState = {
    categoria: 'Esteira Raio-x',
    cobertura_contrato: '',
    localidade: '',
    equipamento: '',
    unidade: '',
    modelo: '',
    numero_serie: '',
    informacoes_pendencias: '',
    status: '',
    ordem_servico: ''
  };

  const [newEqData, setNewEqData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEqData(prev => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setNewEqData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (eq, e) => {
    e.stopPropagation();
    setNewEqData(eq);
    setEditingId(eq.id);
    setIsModalOpen(true);
  };

  const handleSaveEquipment = async () => {
    const isEditing = !!editingId;
    const url = isEditing ? `${API_URL}/api/equipamentos/${editingId}` : `${API_URL}/api/equipamentos`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEqData)
      });
      if (res.ok) {
        const savedEq = await res.json();
        if (isEditing) {
          setEquipamentos(prev => prev.map(e => (e.id === editingId && e.categoria === savedEq.categoria) ? savedEq : e));
        } else {
          setEquipamentos(prev => [savedEq, ...prev]);
        }
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        alert('Erro ao salvar o equipamento. Verifique os campos.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao se comunicar com a API');
    }
  };

  const handleDeleteEquipment = async (id, categoria, e) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja apagar este equipamento?')) return;
    try {
      const res = await apiFetch(`${API_URL}/api/equipamentos/${id}?categoria=${encodeURIComponent(categoria)}`, { method: 'DELETE' });
      if (res.ok) {
        setEquipamentos(prev => prev.filter(eq => !(eq.id === id && eq.categoria === categoria)));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const toggleRow = (id, categoria) => {
    const key = `${id}-${categoria}`;
    setExpandedRow(expandedRow === key ? null : key);
  };

  const generatePDFDraft = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Por favor, permita pop-ups para gerar o PDF.');

    const dateStr = new Date().toLocaleString('pt-BR');
    
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Equipamentos - ${dateStr}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #334155; }
            h1 { text-align: center; color: #0f172a; font-size: 22px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            p.subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background-color: #f8fafc; color: #475569; font-weight: 700; padding: 12px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .status-operante { color: #059669; font-weight: bold; background: #d1fae5; padding: 3px 8px; border-radius: 4px; display: inline-block; }
            .status-pendencia { color: #d97706; font-weight: bold; background: #fef3c7; padding: 3px 8px; border-radius: 4px; display: inline-block; }
            .status-inoperante { color: #e11d48; font-weight: bold; background: #ffe4e6; padding: 3px 8px; border-radius: 4px; display: inline-block; }
            
            @media print {
              @page { margin: 1cm; size: landscape; }
              body { padding: 0; }
              table { box-shadow: none; border: 1px solid #e2e8f0; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Inventário de Equipamentos</h1>
          <p class="subtitle">Gerado em: ${dateStr} &bull; Total listado: ${filteredEquipments.length} equipamentos</p>
          <table>
            <thead>
              <tr>
                <th>Equipamento / Modelo</th>
                <th>Série</th>
                <th>Unidade / Localidade</th>
                <th>OS Atual</th>
                <th style="width: 25%">Pendência</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    filteredEquipments.forEach(eq => {
      let statusClass = '';
      const st = (eq.status || '').toLowerCase();
      if (st.includes('funcionando') || st === 'operante') statusClass = 'status-operante';
      else if (st.includes('inoperante') || st.includes('condenado')) statusClass = 'status-inoperante';
      else statusClass = 'status-pendencia';

      html += `
        <tr>
          <td><strong style="font-size:12px;color:#0f172a;">${eq.equipamento || eq.categoria}</strong><br/>${eq.modelo || '-'}</td>
          <td>${eq.numero_serie || '-'}</td>
          <td><strong style="color:#0f172a;">${eq.unidade || '-'}</strong><br/><span style="font-size:10px;color:#64748b;">${eq.localidade || '-'}</span></td>
          <td>${eq.ordem_servico || '-'}</td>
          <td style="font-size:10px;color:#475569;">${eq.informacoes_pendencias || '-'}</td>
          <td><span class="${statusClass}">${eq.status || '-'}</span></td>
        </tr>
      `;
    });

    html += `
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

  const filteredEquipments = equipamentos.filter(eq => {
    const matchType = filterTypes.length === 0 || filterTypes.includes(eq.categoria);
    
    let matchContract = filterContracts.length === 0;
    const contractVal = (eq.cobertura_contrato || '').toUpperCase();
    if (filterContracts.length > 0) {
      matchContract = filterContracts.some(fc => {
        if (fc === 'Sem Contrato') return contractVal.includes('SEM CONTRATO');
        if (fc === 'Garantia') return contractVal.includes('GARANTIA');
        if (fc === 'Com Contrato') return !contractVal.includes('SEM CONTRATO') && !contractVal.includes('GARANTIA') && contractVal.trim() !== '';
        return false;
      });
    }

    let matchStatus = filterStatuses.length === 0;
    const statusVal = (eq.status || '').toLowerCase();
    if (filterStatuses.length > 0) {
      matchStatus = filterStatuses.some(fs => {
        if (fs === 'Operante') return statusVal.includes('funcionando') || statusVal === 'operante';
        if (fs === 'Funcionando com Pendência') return statusVal.includes('análise') || statusVal.includes('avaliação') || statusVal.includes('pendência') || statusVal.includes('pendencia') || statusVal === 'em manutenção' || statusVal === 'em manutencao';
        if (fs === 'Inoperante') return statusVal.includes('inoperante') || statusVal.includes('condenado');
        return false;
      });
    }

    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      (eq.equipamento || '').toLowerCase().includes(searchLower) ||
      (eq.numero_serie || '').toLowerCase().includes(searchLower) ||
      (eq.modelo || '').toLowerCase().includes(searchLower) ||
      (eq.unidade || '').toLowerCase().includes(searchLower) ||
      (eq.localidade || '').toLowerCase().includes(searchLower) ||
      (eq.ordem_servico || '').toLowerCase().includes(searchLower);
    
    const matchModelo = filterModelos.length === 0 || filterModelos.includes(eq.modelo);

    return matchType && matchContract && matchStatus && matchSearch && matchModelo;
  });

  const modelos = [...new Set(equipamentos.map(eq => eq.modelo).filter(Boolean))].sort();
  const unidades = [...new Set(equipamentos.map(eq => eq.unidade).filter(Boolean))].sort();
  const coberturas = [...new Set(equipamentos.map(eq => eq.cobertura_contrato).filter(Boolean))].sort();

  // KPIs
  const totalEquipments = filteredEquipments.length;
  const operantes = filteredEquipments.filter(e => {
    const status = (e.status || '').toLowerCase();
    return status.includes('funcionando') || status === 'operante';
  }).length;
  
  const funcionandoComPendencia = filteredEquipments.filter(e => {
    const status = (e.status || '').toLowerCase();
    return status.includes('análise') || status.includes('avaliação') || status.includes('pendência') || status.includes('pendencia') || status === 'em manutenção' || status === 'em manutencao';
  }).length;
  
  const inoperantes = filteredEquipments.filter(e => {
    const status = (e.status || '').toLowerCase();
    return status.includes('inoperante') || status.includes('condenado');
  }).length;

  return (
    <div className="space-y-8">
      {/* Metrics for Equipments */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de Equipamentos', value: totalEquipments, color: 'bg-white dark:bg-slate-900', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Operantes', value: operantes, color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Funcionando com Pendência', value: funcionandoComPendencia, color: 'bg-white dark:bg-slate-900', text: 'text-amber-600 dark:text-amber-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Inoperantes', value: inoperantes, color: 'bg-white dark:bg-slate-900', text: 'text-rose-600 dark:text-rose-400', border: 'border-slate-200 dark:border-slate-800' },
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
          <div className="flex gap-3">
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center gap-2 cursor-pointer"
              title="Atualizar Dados"
            >
              <Icons.RefreshCw className={isLoading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={generatePDFDraft}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center gap-2 cursor-pointer"
              title="Gerar Relatório PDF"
            >
              <Icons.FileText className="w-4 h-4" /> Gerar PDF
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 ${showFilters ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'} text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm cursor-pointer`}
            >
              Filtros
            </button>
            <button 
              onClick={openNewModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Icons.Plus /> Novo Equipamento
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-4 items-center">
            <input 
              type="text" 
              placeholder="Buscar por equipamento, série, unidade..." 
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Categorias (Tipos) */}
            <div 
              className="relative" 
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsTypesOpen(false);
                }
              }}
            >
              <button 
                onClick={() => setIsTypesOpen(!isTypesOpen)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px] flex justify-between items-center gap-2 cursor-pointer"
              >
                <span className="truncate max-w-[150px]">
                  {filterTypes.length > 0 ? `${filterTypes.length} Categoria(s)` : 'Categorias'}
                </span>
                <Icons.ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>
              
              {isTypesOpen && (
                <div className="absolute top-full mt-1 left-0 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-2 flex flex-col gap-1">
                  {['Esteira Raio-x', 'Bodyscan', 'Pórticos'].map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 bg-white"
                        checked={filterTypes.includes(opt)}
                        onChange={(e) => {
                          if (e.target.checked) setFilterTypes([...filterTypes, opt]);
                          else setFilterTypes(filterTypes.filter(item => item !== opt));
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Contratos */}
            <div 
              className="relative" 
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsContractsOpen(false);
                }
              }}
            >
              <button 
                onClick={() => setIsContractsOpen(!isContractsOpen)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px] flex justify-between items-center gap-2 cursor-pointer"
              >
                <span className="truncate max-w-[150px]">
                  {filterContracts.length > 0 ? `${filterContracts.length} Contrato(s)` : 'Contratos'}
                </span>
                <Icons.ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>
              
              {isContractsOpen && (
                <div className="absolute top-full mt-1 left-0 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-2 flex flex-col gap-1">
                  {['Com Contrato', 'Sem Contrato', 'Garantia'].map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 bg-white"
                        checked={filterContracts.includes(opt)}
                        onChange={(e) => {
                          if (e.target.checked) setFilterContracts([...filterContracts, opt]);
                          else setFilterContracts(filterContracts.filter(item => item !== opt));
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Statuses */}
            <div 
              className="relative" 
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsStatusesOpen(false);
                }
              }}
            >
              <button 
                onClick={() => setIsStatusesOpen(!isStatusesOpen)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px] flex justify-between items-center gap-2 cursor-pointer"
              >
                <span className="truncate max-w-[150px]">
                  {filterStatuses.length > 0 ? `${filterStatuses.length} Status` : 'Status'}
                </span>
                <Icons.ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>
              
              {isStatusesOpen && (
                <div className="absolute top-full mt-1 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-2 flex flex-col gap-1">
                  {['Operante', 'Funcionando com Pendência', 'Inoperante'].map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 bg-white"
                        checked={filterStatuses.includes(opt)}
                        onChange={(e) => {
                          if (e.target.checked) setFilterStatuses([...filterStatuses, opt]);
                          else setFilterStatuses(filterStatuses.filter(item => item !== opt));
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div 
              className="relative" 
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsModelosOpen(false);
                }
              }}
            >
              <button 
                onClick={() => setIsModelosOpen(!isModelosOpen)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px] flex justify-between items-center gap-2 cursor-pointer"
              >
                <span className="truncate max-w-[150px]">
                  {filterModelos.length > 0 ? `${filterModelos.length} Modelo(s)` : 'Todos os Modelos'}
                </span>
                <Icons.ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>
              
              {isModelosOpen && (
                <div className="absolute top-full mt-1 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                  {modelos.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500 text-center">Nenhum modelo</div>
                  ) : (
                    modelos.map((m, i) => (
                      <label key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                        <input 
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 bg-white"
                          checked={filterModelos.includes(m)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilterModelos([...filterModelos, m]);
                            } else {
                              setFilterModelos(filterModelos.filter(item => item !== m));
                            }
                          }}
                        />
                        <span className="truncate">{m}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
            {(searchTerm || filterTypes.length > 0 || filterContracts.length > 0 || filterStatuses.length > 0 || filterModelos.length > 0) && (
              <button 
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        )}

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
                  const key = `${eq.id}-${eq.categoria}`;
                  const isExpanded = expandedRow === key;

                  return (
                    <React.Fragment key={key}>
                      <tr 
                        onClick={() => toggleRow(eq.id, eq.categoria)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                      >
                        <td className="px-6 py-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                          {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Icons.Server /> {eq.equipamento || eq.categoria}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {eq.numero_serie || '-'} • {eq.modelo || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium flex flex-col justify-center">
                          <div className="flex items-center gap-1.5"><Icons.MapPin /> {eq.unidade || '-'}</div>
                          <div className="text-xs text-slate-500 mt-1 ml-5">{eq.localidade || '-'}</div>
                        </td>
                        <td className="px-6 py-4"><ContractBadge status={eq.cobertura_contrato} /></td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {eq.ordem_servico && eq.ordem_servico.trim() !== '-' ? (
                            <span className="inline-block px-2.5 py-1.5 text-xs font-mono font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50 shadow-sm">
                              {eq.ordem_servico}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4"><EqStatusBadge status={eq.status} /></td>
                      </tr>

                      {/* Expanded Content Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-500">
                          <td colSpan="7" className="p-0 border-b border-slate-200 dark:border-slate-800">
                            <div className="px-16 py-8">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Contrato */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                                    <Icons.FileSignature className="w-4 h-4" /> Contrato
                                  </p>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {eq.contrato || '-'}
                                  </p>
                                </div>
                                {/* Data de Garantia */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                                    <Icons.Calendar className="w-4 h-4" /> Data de Garantia
                                  </p>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {eq.data_garantia || 'Não se aplica'}
                                  </p>
                                </div>
                                {/* Informações/Pendências */}
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                                    <Icons.AlertCircle className="w-4 h-4" /> Informações / Pendências
                                  </p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {eq.informacoes_pendencias || '-'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-6 flex justify-end gap-3">
                                <button 
                                  onClick={(e) => openEditModal(eq, e)}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <Icons.Edit className="w-4 h-4" /> Editar
                                </button>
                                <button 
                                  onClick={(e) => handleDeleteEquipment(eq.id, eq.categoria, e)}
                                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <Icons.Trash className="w-4 h-4" /> Excluir
                                </button>
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
                
                {/* Tipo de Equipamento (Categoria) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Equipamento (Aba)</label>
                  <select name="categoria" value={newEqData.categoria} onChange={handleInputChange} disabled={!!editingId} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    <option value="Esteira Raio-x">Esteira Raio-x</option>
                    <option value="Bodyscan">Bodyscan</option>
                    <option value="Pórticos">Pórticos</option>
                  </select>
                </div>

                {/* Equipamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipamento</label>
                  <input name="equipamento" value={newEqData.equipamento} onChange={handleInputChange} type="text" placeholder="Ex: Esteira Raio-X" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

                {/* Unidade */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Unidade</label>
                  <input name="unidade" list="unidades-list" value={newEqData.unidade} onChange={handleInputChange} type="text" placeholder="Ex: Presídio Central" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                  <datalist id="unidades-list">
                    {unidades.map((u, i) => <option key={i} value={u} />)}
                  </datalist>
                </div>

                {/* Localidade */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Localidade</label>
                  <input name="localidade" value={newEqData.localidade} onChange={handleInputChange} type="text" placeholder="Ex: Portaria Principal" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
                  <input name="modelo" list="modelos-list" value={newEqData.modelo} onChange={handleInputChange} type="text" placeholder="Ex: Rapiscan 620XR" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                  <datalist id="modelos-list">
                    {modelos.map((m, i) => <option key={i} value={m} />)}
                  </datalist>
                </div>

                {/* Número de Série */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Série</label>
                  <input name="numero_serie" value={newEqData.numero_serie} onChange={handleInputChange} type="text" placeholder="Ex: SN-XR-88902" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

                {/* Cobertura de Contrato */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cobertura de Contrato</label>
                  <input name="cobertura_contrato" list="coberturas-list" value={newEqData.cobertura_contrato} onChange={handleInputChange} type="text" placeholder="Ex: Empresa X / Com Contrato" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                  <datalist id="coberturas-list">
                    {coberturas.map((c, i) => <option key={i} value={c} />)}
                  </datalist>
                </div>

                {/* Ordem de Serviço Atual */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ordem de Serviço (atual)</label>
                  <input name="ordem_servico" value={newEqData.ordem_servico} onChange={handleInputChange} type="text" placeholder="Ex: OS 123/24" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
                </div>

                {/* Status de Funcionamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Operacional</label>
                  <select name="status" value={newEqData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="">Selecione...</option>
                    <option value="Operante">Operante</option>
                    <option value="Funcionando com Pendência">Funcionando com Pendência</option>
                    <option value="Inoperante">Inoperante</option>
                  </select>
                </div>
                
                {/* Informações/Pendências */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Informações / Pendências</label>
                  <textarea name="informacoes_pendencias" value={newEqData.informacoes_pendencias} onChange={handleInputChange} placeholder="Ex: Aguardando peça..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 min-h-[100px]" />
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