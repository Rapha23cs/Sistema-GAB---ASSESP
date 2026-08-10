import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { TypeBadge, StatusBadge } from '../components/Badges';
import { DUMMY_ORDERS, DUMMY_CONTRACTS } from '../data/mockData';
import { NovaOSView } from './NovaOSView';
import { UpdateTaskModal } from '../components/UpdateTaskModal';
import { AddEquipmentToOSModal } from '../components/AddEquipmentToOSModal';
import { EditOSModal } from '../components/EditOSModal';

export const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [equipFilter, setEquipFilter] = useState({ rowId: null, status: null });
  const [isCreatingOS, setIsCreatingOS] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [addingEquipmentToOS, setAddingEquipmentToOS] = useState(null);
  const [editingGlobalOS, setEditingGlobalOS] = useState(null);

  // Filtros
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterContract, setFilterContract] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [contratosDb, setContratosDb] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = () => {
    setIsLoading(true);
    fetch('http://localhost:3001/api/contratos')
      .then(res => res.json())
      .then(data => setContratosDb(data))
      .catch(err => console.error(err));
      
    fetch(`http://localhost:3001/api/oss?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const groupedMap = new Map();
          data.forEach(os => {
            const key = os.ordem_servico || `sem-os-${os.id}`;
            if (!groupedMap.has(key)) {
              groupedMap.set(key, { ...os, equipamentos: [], allRows: [] });
            }
            const group = groupedMap.get(key);
            
            group.allRows.push({ id: os.id, categoria: os.categoria });
            
            if (os.equipamento || os.numero_serie) {
              group.equipamentos.push({
                id: os.id,
                categoria: os.categoria,
                nome: os.equipamento,
                modelo: os.modelo,
                numero_serie: os.numero_serie,
                unidade: os.unidade,
                status: os.status,
                tarefa: os.tarefa,
                data_tarefa: os.data_tarefa,
                tratativa: os.tratativa || '',
                observacoes_tarefa: os.observacoes_tarefa || ''
              });
            }
          });
          const groupedOrders = Array.from(groupedMap.values());
          groupedOrders.forEach(go => {
            if (go.equipamentos.length > 0) {
              // Calculate global status based on children
              const allStatus = go.equipamentos.map(e => {
                const s = (e.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                return s;
              });
              
              if (allStatus.every(s => s === 'concluido')) {
                go.status = 'CONCLUIDO';
              } else if (allStatus.every(s => s === 'aguardando' || s === '')) {
                go.status = 'AGUARDANDO';
              } else {
                go.status = 'PENDENTE';
              }
            }

            if (go.equipamentos.length > 1) {
              go.equipamento = 'Múltiplos Equipamentos';
              go.modelo = '-';
              go.numero_serie = '-';
              const unidades = Array.from(new Set(go.equipamentos.map(e => e.unidade).filter(Boolean)));
              go.unidade = unidades.length > 1 ? 'Várias Unidades' : (unidades[0] || '-');
            }
          });
          setOrders(groupedOrders);
        } else {
          console.error('Expected array for orders, got:', data);
          setOrders([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    setEquipFilter({ rowId: null, status: null });
  };

  const toggleTaskStatus = async (orderId, taskId) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id !== orderId) return order;

        const newTasks = order.tarefas.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            concluida: !t.concluida
          };
        });

        const allTasks = newTasks;
        const allCompleted = allTasks.length > 0 && allTasks.every(t => t.concluida);
        
        return {
          ...order,
          tarefas: newTasks,
          status: allCompleted ? 'Concluída' : 'Em Andamento'
        };
      });
    });
  };

  const handleSaveOS = async (novaOsData) => {
    const { equipamentos, unidades, ...restData } = novaOsData;
    const itemsToSave = [];

    if (equipamentos && equipamentos.length > 0) {
      equipamentos.forEach(eq => {
        itemsToSave.push({
          ...restData,
          categoria: eq.categoria,
          equipamento: eq.equipamento,
          modelo: eq.modelo,
          numero_serie: eq.numero_serie,
          unidade: eq.unidade
        });
      });
    }

    const unidadesComEquipamentos = new Set((equipamentos || []).map(eq => eq.unidade));

    if (unidades && unidades.length > 0) {
      unidades.forEach(uni => {
        if (!unidadesComEquipamentos.has(uni)) {
          itemsToSave.push({
            ...restData,
            equipamento: '',
            modelo: '',
            numero_serie: '',
            unidade: uni
          });
        }
      });
    }

    if (itemsToSave.length === 0) {
      alert("Adicione pelo menos um equipamento ou unidade à OS.");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/oss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToSave)
      });
      if (!res.ok) {
        throw new Error("Erro ao salvar OS.");
      }

      fetchData(); // Reloads data from server
      setIsCreatingOS(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar OS.");
    }
  };

  const handleUpdateEquipmentTask = (updatedEq) => {
    fetch(`http://localhost:3001/api/oss/${updatedEq.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoria: updatedEq.categoria,
        tarefa: updatedEq.tarefa,
        data_tarefa: updatedEq.data_tarefa,
        tratativa: updatedEq.tratativa,
        data_tratativa: updatedEq.data_tratativa,
        observacoes_tratativa: updatedEq.observacoes_tratativa,
        observacoes_tarefa: updatedEq.observacoes_tarefa,
        status: updatedEq.status
      })
    })
    .then(res => {
      if (res.ok) {
        fetchData();
        setEditingEquipment(null);
      } else {
        alert("Erro ao atualizar o andamento do equipamento.");
      }
    })
    .catch(err => console.error('Erro na requisição PUT:', err));
  };

  const handleEditGlobalOS = async (formData) => {
    const order = editingGlobalOS;
    if (!order || !order.allRows) return;
    
    // Disable refreshing while loop is running to prevent race conditions or weird UI updates
    let hasError = false;
    for (const row of order.allRows) {
      try {
        const res = await fetch(`http://localhost:3001/api/oss/${row.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoria: row.categoria,
            ordem_servico: formData.ordem_servico,
            sei: formData.sei,
            tipo_servico: formData.tipo_servico,
            data_assinatura: formData.data_assinatura
          })
        });
        if (!res.ok) hasError = true;
      } catch (err) {
        console.error('Erro ao atualizar OS geral para o ID:', row.id, err);
        hasError = true;
      }
    }
    
    if (hasError) {
      alert("Houve um erro ao atualizar um ou mais itens da OS.");
    }
    
    setEditingGlobalOS(null);
    fetchData();
  };

  const handleAddEquipmentToOS = async (formData) => {
    const order = addingEquipmentToOS;
    const itemsToSave = [];

    if (formData.equipamentos && formData.equipamentos.length > 0) {
      formData.equipamentos.forEach(eq => {
        itemsToSave.push({
          categoria: order.categoria,
          ordem_servico: order.ordem_servico,
          sei: order.sei,
          processo: order.processo,
          contrato: order.contrato,
          tipo_servico: order.tipo_servico,
          data_assinatura: order.data_assinatura,
          equipamento: eq.equipamento || eq.nome,
          modelo: eq.modelo,
          numero_serie: eq.numero_serie,
          unidade: eq.unidade,
          status: 'AGUARDANDO'
        });
      });
    }

    const unidadesComEquipamentosAdd = new Set((formData.equipamentos || []).map(eq => eq.unidade));

    if (formData.unidades && formData.unidades.length > 0) {
      formData.unidades.forEach(uni => {
        if (!unidadesComEquipamentosAdd.has(uni)) {
          itemsToSave.push({
            categoria: order.categoria,
            ordem_servico: order.ordem_servico,
            sei: order.sei,
            processo: order.processo,
            contrato: order.contrato,
            tipo_servico: order.tipo_servico,
            data_assinatura: order.data_assinatura,
            equipamento: '',
            modelo: '',
            numero_serie: '',
            unidade: uni,
            status: 'AGUARDANDO'
          });
        }
      });
    }

    try {
      const res = await fetch('http://localhost:3001/api/oss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToSave)
      });
      if (!res.ok) {
        throw new Error("Erro ao adicionar equipamentos à OS.");
      }

      fetchData();
      setAddingEquipmentToOS(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar equipamentos à OS.");
    }
  };

  const handleDeleteOS = async (order) => {
    if (!window.confirm(`ATENÇÃO: Tem certeza que deseja apagar a OS ${order.ordem_servico || 'Sem Número'}? \n\nTodos os equipamentos vinculados a esta OS serão excluídos.`)) {
      return;
    }

    // Ordena por ID decrescente para apagar de baixo pra cima, evitando que os índices das linhas mudem
    const sortedRows = [...order.allRows].sort((a, b) => b.id - a.id);

    try {
      for (const row of sortedRows) {
        const res = await fetch(`http://localhost:3001/api/oss/${row.id}?categoria=${encodeURIComponent(row.categoria)}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error("Erro ao deletar linha ID: " + row.id);
      }
      
      // Se a linha apagada for a que estava expandida, fecha ela
      if (expandedRow && expandedRow.includes(`os-${order.categoria}-${order.id}`)) {
        setExpandedRow(null);
      }
      
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar a OS.");
    }
  };

  if (isCreatingOS) {
    return <NovaOSView onCancel={() => setIsCreatingOS(false)} onSave={handleSaveOS} />;
  }

  const totalOS = orders.length;
  // Normaliza string removendo acentos para comparacoes seguras
  const norm = (str) => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const getStatus = (os) => {
    const s = norm(os.status);
    if (s.includes('conclu') || s === 'ok') return 'concluido';
    if (s.includes('aguardando')) return 'aguardando_manutencao';
    if (s.includes('pendente')) return 'pendente';
    if (s.includes('andamento')) return 'em_andamento';
    // fallback: tenta nos campos de texto
    const obs = norm([os.tarefa, os.tratativa, os.observacoes_tarefa, os.observacoes_tratativa].filter(Boolean).join(' '));
    if (obs.includes('conclu') || obs.includes('finaliz')) return 'concluido';
    if (obs.includes('aguardando manutenc')) return 'aguardando_manutencao';
    if (obs.includes('pendente') || obs.includes('pendenc')) return 'pendente';
    return 'em_andamento';
  };
  const filteredOrders = orders.filter(order => {
    if (filterType !== 'Todos') {
      const typeStr = norm(order.tipo_servico);
      const fTypeStr = norm(filterType);
      if (!typeStr.includes(fTypeStr)) return false;
    }
    
    if (filterStatus !== 'Todos') {
      const status = getStatus(order);
      if (status !== filterStatus) return false;
    }
    
    if (filterContract !== 'Todos') {
      const contractStr = norm(order.contrato);
      const fContractStr = norm(filterContract);
      if (contractStr !== fContractStr) return false;
    }
    
    return true;
  });

  const concluidas = filteredOrders.filter(o => getStatus(o) === 'concluido').length;
  const pendentes = filteredOrders.filter(o => getStatus(o) === 'pendente').length;
  const aguardando = filteredOrders.filter(o => getStatus(o) === 'aguardando_manutencao').length;

  return (
    <div className="space-y-8 relative">
      {editingEquipment && (
        <UpdateTaskModal 
          eq={editingEquipment} 
          onCancel={() => setEditingEquipment(null)} 
          onSave={handleUpdateEquipmentTask}
        />
      )}
      {addingEquipmentToOS && (
        <AddEquipmentToOSModal
          order={addingEquipmentToOS}
          onCancel={() => setAddingEquipmentToOS(null)}
          onSave={handleAddEquipmentToOS}
        />
      )}
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de OS', value: filteredOrders.length.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Concluídas', value: concluidas.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Pendentes', value: pendentes.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-rose-600 dark:text-rose-400', border: 'border-slate-200 dark:border-slate-800' },
          { label: 'Aguardando', value: aguardando.toString(), color: 'bg-white dark:bg-slate-900', text: 'text-amber-600 dark:text-amber-400', border: 'border-slate-200 dark:border-slate-800' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 transition-transform duration-300 cursor-default group`}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-500">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 transition-colors duration-500">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.Briefcase /> Ordens Recentes
          </h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center gap-2 cursor-pointer"
              title="Atualizar Dados"
            >
              <Icons.RefreshCw className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 ${showFilters ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'} text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm cursor-pointer`}
            >
              Filtros
            </button>
            <button 
              onClick={() => setIsCreatingOS(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Icons.Plus /> Nova OS
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px]"
            >
              <option value="Todos">Tipo (Todos)</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Corretiva">Corretiva</option>
              <option value="Vistoria">Vistoria</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px]"
            >
              <option value="Todos">Status (Todos)</option>
              <option value="concluido">CONCLUÍDO</option>
              <option value="pendente">PENDENTE</option>
              <option value="aguardando_manutencao">AGUARDANDO</option>
              <option value="em_andamento">Em Andamento (S/ Status)</option>
            </select>
            <select
              value={filterContract}
              onChange={(e) => setFilterContract(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[200px]"
            >
              <option value="Todos">Contrato (Todos)</option>
              <option value="N° 002/2024 - VMI">N° 002/2024 - VMI</option>
              <option value="N° 056/2026 - TECHSCAN">N° 056/2026 - TECHSCAN</option>
            </select>
            {(filterType !== 'Todos' || filterStatus !== 'Todos' || filterContract !== 'Todos') && (
              <button
                onClick={() => {
                  setFilterType('Todos');
                  setFilterStatus('Todos');
                  setFilterContract('Todos');
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                title="Limpar Filtros"
              >
                <Icons.X size={16} /> Limpar Filtros
              </button>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">OS Nº</th>
                <th className="px-6 py-4 font-medium">Equipamento</th>
                <th className="px-6 py-4 font-medium">Unidade</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm transition-colors duration-500">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const rowId = `os-${order.categoria}-${order.id}-${index}`;
                  const isExpanded = expandedRow === rowId;
                  const status = getStatus(order);
                  
                  const equipStatuses = order.equipamentos ? order.equipamentos.map(eq => {
                    return (eq.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_');
                  }) : [];
                  
                  const completedCount = equipStatuses.filter(s => s === 'concluido').length;
                  const waitingCount = equipStatuses.filter(s => s === 'aguardando' || s === '').length;
                  const pendingCount = equipStatuses.filter(s => s !== 'concluido' && s !== 'aguardando' && s !== '').length;

                  return (
                  <React.Fragment key={rowId}>
                    <tr onClick={() => toggleRow(rowId)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors duration-200">
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500">{isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-base">{order.ordem_servico || 'Sem Número'}</div>
                        <div className="mt-1.5"><TypeBadge type={order.tipo_servico || 'Não Definido'} /></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {order.equipamento || 'Equipamento N/A'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Mod: {order.modelo || 'N/A'} | S/N: {order.numero_serie || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{order.unidade || '-'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-500">
                        <td colSpan="5" className="p-0 border-b border-slate-200 dark:border-slate-800">
                          <div className="px-16 py-6 space-y-6">
                            <div className="grid grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm">
                               <div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Processo</p>
                                 <p className="text-slate-800 dark:text-slate-200">{order.processo || '-'}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">SEI</p>
                                 <p className="text-slate-800 dark:text-slate-200">{order.sei || '-'}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Contrato</p>
                                 <p className="text-slate-800 dark:text-slate-200 font-medium text-blue-600 dark:text-blue-400">{order.contrato}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Data Assinatura</p>
                                 <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Icons.Calendar /> {order.data_assinatura}</p>
                               </div>

                            </div>

                             {order.equipamentos && order.equipamentos.length > 0 && (
                               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base">
                                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-700 dark:text-blue-400">
                                          <Icons.Monitor />
                                        </div>
                                        Equipamentos ({order.equipamentos.length})
                                      </div>
                                      <div className="flex items-center gap-2 ml-9 mt-1">
                                        <span 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEquipFilter(prev => prev.rowId === rowId && prev.status === 'concluido' ? { rowId: null, status: null } : { rowId, status: 'concluido' });
                                          }}
                                          className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded cursor-pointer transition-all ${
                                            equipFilter.rowId === rowId && equipFilter.status === 'concluido' 
                                              ? 'bg-emerald-600 text-white shadow-sm scale-105' 
                                              : 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/40'
                                          }`} title={`Clique para destacar ${completedCount} Concluídos`}>
                                          {completedCount} <span className="hidden sm:inline">Concluído{completedCount !== 1 ? 's' : ''}</span>
                                        </span>
                                        <span 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEquipFilter(prev => prev.rowId === rowId && prev.status === 'aguardando' ? { rowId: null, status: null } : { rowId, status: 'aguardando' });
                                          }}
                                          className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded cursor-pointer transition-all ${
                                            equipFilter.rowId === rowId && equipFilter.status === 'aguardando' 
                                              ? 'bg-amber-600 text-white shadow-sm scale-105' 
                                              : 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-800/40'
                                          }`} title={`Clique para destacar ${waitingCount} Aguardando`}>
                                          {waitingCount} <span className="hidden sm:inline">Aguardando</span>
                                        </span>
                                        <span 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEquipFilter(prev => prev.rowId === rowId && prev.status === 'pendente' ? { rowId: null, status: null } : { rowId, status: 'pendente' });
                                          }}
                                          className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded cursor-pointer transition-all ${
                                            equipFilter.rowId === rowId && equipFilter.status === 'pendente' 
                                              ? 'bg-rose-600 text-white shadow-sm scale-105' 
                                              : 'bg-rose-100/50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200/50 dark:hover:bg-rose-800/40'
                                          }`} title={`Clique para destacar ${pendingCount} Pendentes`}>
                                          {pendingCount} <span className="hidden sm:inline">Pendente{pendingCount !== 1 ? 's' : ''}</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-3">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingGlobalOS(order);
                                        }}
                                        className="px-4 py-2 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                                      >
                                        <Icons.Edit size={16} /> Editar OS
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteOS(order);
                                        }}
                                        className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                                      >
                                        <Icons.Trash size={16} /> Deletar OS
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAddingEquipmentToOS(order);
                                        }}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                                      >
                                        <Icons.Plus size={16} /> Adicionar Equipamento/Unidade
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pl-8">
                                    {(() => {
                                      const sortedEquipamentos = [...order.equipamentos].sort((a, b) => {
                                        if (equipFilter.rowId !== rowId || !equipFilter.status) return 0;
                                        
                                        const statusA = (a.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_');
                                        const statusB = (b.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_');
                                        
                                        const getMatch = (s) => {
                                          if (equipFilter.status === 'concluido') return s === 'concluido';
                                          if (equipFilter.status === 'aguardando') return s === 'aguardando' || s === '';
                                          if (equipFilter.status === 'pendente') return s !== 'concluido' && s !== 'aguardando' && s !== '';
                                          return false;
                                        };
                                        
                                        const matchA = getMatch(statusA);
                                        const matchB = getMatch(statusB);
                                        
                                        if (matchA && !matchB) return -1;
                                        if (!matchA && matchB) return 1;
                                        return 0;
                                      });
                                      
                                      return sortedEquipamentos.map((eq, i) => (
                                        <div key={eq.id || i} className={`p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-3 relative overflow-hidden transition-all duration-500 ${
                                          equipFilter.rowId === rowId && equipFilter.status 
                                            ? (
                                              (() => {
                                                const s = (eq.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_');
                                                const isMatch = (equipFilter.status === 'concluido' && s === 'concluido') || 
                                                              (equipFilter.status === 'aguardando' && (s === 'aguardando' || s === '')) || 
                                                              (equipFilter.status === 'pendente' && (s !== 'concluido' && s !== 'aguardando' && s !== ''));
                                                return isMatch ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-40 grayscale-[50%]'
                                              })()
                                            ) : ''
                                        }`}>
                                        <div className="flex justify-between items-start gap-4">
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{eq.nome}</span>
                                              {eq.unidade && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium truncate max-w-[150px]" title={eq.unidade}>
                                                  {eq.unidade}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">S/N: {eq.numero_serie || 'N/A'}</span>
                                          </div>
                                          <div className="flex items-center gap-3 shrink-0">
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingEquipment(eq);
                                              }}
                                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1.5"
                                            >
                                              <Icons.Edit size={12} /> Atualizar
                                            </button>
                                            <StatusBadge status={eq.status || 'AGUARDANDO'} />
                                          </div>
                                        </div>
                                        {eq.tarefa && (
                                          <div className="mt-2 flex flex-col gap-2">
                                            <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2.5 text-xs border border-slate-100 dark:border-slate-700/50 flex flex-wrap justify-between items-center gap-2">
                                              <span className="text-slate-500 dark:text-slate-400 font-medium">Tarefa: <span className="text-slate-700 dark:text-slate-200 font-bold">{eq.tarefa}</span></span>
                                              {eq.data_tarefa && (
                                                <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                  {eq.data_tarefa}
                                                </span>
                                              )}
                                            </div>
                                            {(eq.tratativa || eq.observacoes_tratativa) && (
                                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg p-2.5 text-xs">
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px]">Tratativa {eq.tratativa ? `#${eq.tratativa}` : ''}</span>
                                                    {eq.data_tratativa && <span className="text-[10px] text-blue-600 dark:text-blue-500 font-medium">{eq.data_tratativa}</span>}
                                                  </div>
                                                  {eq.observacoes_tratativa && (
                                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{eq.observacoes_tratativa}</p>
                                                  )}
                                                </div>
                                              )}
                                              {eq.observacoes_tarefa && (
                                                <div className="bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2.5 text-xs">
                                                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase text-[10px]">Observações da Tarefa</span>
                                                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{eq.observacoes_tarefa}</p>
                                                </div>
                                              )}                      
                                          </div>
                                        )}
                                      </div>
                                    ));
                                  })()}
                                  </div>
                               </div>
                             )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma ordem de serviço encontrada para esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Icons.LayoutList /> Detalhes da Tarefa
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ref: <span className="font-bold">{selectedTask.orderNumber}</span></p>
                  <TypeBadge type={selectedTask.orderType} />
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors cursor-pointer shadow-sm"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded border border-blue-100 dark:border-blue-800/50">
                        {selectedTask.id || '#N/A'}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${selectedTask.concluida ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {selectedTask.concluida ? 'Concluída' : 'Pendente'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedTask.descricao}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data de Execução</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Icons.Clock /> {selectedTask.data_tarefa}
                    </span>
                  </div>
                  {selectedTask.equipFull && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Equipamento Vinculado</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Icons.Monitor /> {selectedTask.equipFull.nome}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">S/N: {selectedTask.equipFull.numero_serie || 'N/A'}</span>
                    </div>
                  )}
                </div>

                {selectedTask.anexo_tarefa && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Documento Anexado</span>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                        <Icons.FileText /> {selectedTask.anexo_tarefa}
                      </span>
                      <button className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium">
                        Baixar Arquivo
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedTask.observacoes && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Observações</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      {selectedTask.observacoes}
                    </p>
                  </div>
                )}
              </div>

              {selectedTask.tratativa ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-400 dark:bg-slate-500"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.MessageSquare className="text-slate-700 dark:text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tratativa</h3>
                    {selectedTask.tratativa_id && (
                      <span className="text-xs font-mono bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 ml-2">
                        {selectedTask.tratativa_id}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{selectedTask.tratativa}</p>
                  
                  {selectedTask.anexo_tratativa && (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                        <Icons.FileText /> {selectedTask.anexo_tratativa}
                      </span>
                      <button className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium">
                        Baixar Arquivo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Nenhuma tratativa registrada para esta tarefa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {editingGlobalOS && (
        <EditOSModal 
          os={editingGlobalOS}
          onSave={handleEditGlobalOS}
          onCancel={() => setEditingGlobalOS(null)}
        />
      )}
    </div>
  );
};