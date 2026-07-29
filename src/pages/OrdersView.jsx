import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { TypeBadge, StatusBadge } from '../components/Badges';
import { DUMMY_ORDERS } from '../data/mockData';
import { NovaOSView } from './NovaOSView';

export const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCreatingOS, setIsCreatingOS] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  useEffect(() => {
    // Como estamos focando no front, usamos o DUMMY_ORDERS direto.
    // Em produção ou quando ligar o backend: fetch('http://localhost:3333/api/orders')
    setOrders(DUMMY_ORDERS);
  }, []);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const toggleTaskStatus = async (orderId, taskId) => {
    // Optimistic UI Update
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

  const handleSaveOS = (novaOsData) => {
    // Add dummy ID and push to local state
    const novaOs = {
      ...novaOsData,
      id: Math.random().toString(36).substr(2, 9), // Fake ID
      numero_os: novaOsData.numero_os || `OS-${Math.floor(Math.random() * 1000)}/2026`
    };
    
    setOrders(prev => [novaOs, ...prev]);
    setIsCreatingOS(false);
  };

  if (isCreatingOS) {
    return <NovaOSView onCancel={() => setIsCreatingOS(false)} onSave={handleSaveOS} />;
  }

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de OS', value: '128', color: 'bg-white', text: 'text-slate-800', border: 'border-slate-200' },
          { label: 'Em Andamento', value: '14', color: 'bg-white', text: 'text-blue-600', border: 'border-slate-200' },
          { label: 'Concluídas (Mês)', value: '86', color: 'bg-white', text: 'text-emerald-600', border: 'border-slate-200' },
          { label: 'Atrasadas', value: '3', color: 'bg-white', text: 'text-rose-600', border: 'border-slate-200' },
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
            <Icons.Briefcase /> Ordens Recentes
          </h2>
          <button 
            onClick={() => setIsCreatingOS(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Icons.Plus /> Nova OS
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">OS Nº</th>
                <th className="px-6 py-4 font-medium">Equipamento</th>
                <th className="px-6 py-4 font-medium">Local</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {orders.map((order) => {
                const isExpanded = expandedRow === order.id;
                return (
                  <React.Fragment key={order.id}>
                    <tr onClick={() => toggleRow(order.id)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-6 py-4 text-slate-400">{isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">{order.numero_os}</div>
                        <div className="mt-1.5"><TypeBadge type={order.tipo_servico} /></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {order.equipamentos && order.equipamentos.length > 0 
                            ? (order.equipamentos.length === 1 ? order.equipamentos[0].nome : `${order.equipamentos.length} Equipamentos`) 
                            : (order.equipamento || 'N/A')}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {order.equipamentos && order.equipamentos.length > 0 
                            ? (order.equipamentos.length === 1 ? `S/N: ${order.equipamentos[0].numero_serie || 'N/A'}` : 'Vários itens') 
                            : `S/N: ${order.numero_serie || 'N/A'}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{order.unidade}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          order.status === 'Concluída' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="5" className="p-0 border-b border-slate-200">
                          <div className="px-16 py-6 space-y-6">
                            <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm">
                               <div>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Processo</p>
                                 <p className="text-slate-800">{order.processo}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">SEI</p>
                                 <p className="text-slate-800">{order.sei}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Contrato</p>
                                 <p className="text-slate-800 font-medium text-blue-600">{order.contrato}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Data Assinatura</p>
                                 <p className="text-slate-800 flex items-center gap-1.5"><Icons.Calendar /> {order.data_assinatura}</p>
                               </div>
                            </div>

                             {order.equipamentos && order.equipamentos.length > 0 && (
                               <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-base">
                                    <div className="p-1.5 bg-blue-50 rounded-md text-blue-700">
                                      <Icons.Monitor />
                                    </div>
                                    Equipamentos ({order.equipamentos.length})
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                                    {order.equipamentos.map((eq, i) => (
                                      <div key={eq.id || i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-1">
                                        <span className="font-bold text-slate-700 text-sm">{eq.nome}</span>
                                        <span className="text-xs text-slate-500">Modelo: {eq.modelo || 'N/A'} | S/N: {eq.numero_serie || 'N/A'}</span>
                                      </div>
                                    ))}
                                  </div>
                               </div>
                             )}

                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                              <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-base">
                                <div className="p-1.5 bg-blue-50 rounded-md text-blue-700">
                                  <Icons.CheckSquare />
                                </div>
                                Tarefas ({order.tarefas?.length || 0})
                              </div>
                              <div className="space-y-4 pl-8 border-l-2 border-slate-200 ml-3">
                                {order.tarefas?.map((task) => {
                                  const isCompleted = task.concluida;
                                  return (
                                    <div 
                                      key={task.id} 
                                      className={`p-4 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}
                                      onClick={() => {
                                        const equipFull = order.equipamentos?.find(e => e.nome === task.equipamento_nome);
                                        setSelectedTask({ 
                                          ...task, 
                                          orderNumber: order.numero_os,
                                          orderType: order.tipo_servico,
                                          equipFull 
                                        });
                                      }}
                                    >
                                      <div className="flex items-start gap-4">
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTaskStatus(order.id, task.id);
                                          }}
                                          className={`mt-1 flex items-center justify-center w-6 h-6 rounded cursor-pointer transition-colors ${isCompleted ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-blue-600 bg-white border border-slate-300 shadow-sm'}`}
                                        >
                                          {isCompleted ? <Icons.CheckSquare /> : <Icons.Square />}
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                              <div className="flex flex-col gap-1">
                                                <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                                  {task.id && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 font-mono no-underline">{task.id}</span>}
                                                  {task.descricao}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500 flex items-center gap-1"><Icons.Clock /> {task.data_tarefa}</span>
                                              </div>
                                            </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
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

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Icons.LayoutList /> Detalhes da Tarefa
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500">Ref: <span className="font-bold">{selectedTask.orderNumber}</span></p>
                  <TypeBadge type={selectedTask.orderType} />
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors cursor-pointer shadow-sm"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                        {selectedTask.id || '#N/A'}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${selectedTask.concluida ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedTask.concluida ? 'Concluída' : 'Pendente'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedTask.descricao}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data de Execução</span>
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <Icons.Clock /> {selectedTask.data_tarefa}
                    </span>
                  </div>
                  {selectedTask.equipFull && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Equipamento Vinculado</span>
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Icons.Monitor /> {selectedTask.equipFull.nome}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block">S/N: {selectedTask.equipFull.numero_serie || 'N/A'}</span>
                    </div>
                  )}
                </div>

                {selectedTask.anexo_tarefa && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Documento Anexado</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
                        <Icons.FileText /> {selectedTask.anexo_tarefa}
                      </span>
                      <button className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                        Baixar Arquivo
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedTask.observacoes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Observações</span>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedTask.observacoes}
                    </p>
                  </div>
                )}
              </div>

              {selectedTask.tratativa ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.MessageSquare />
                    <h3 className="text-base font-bold text-slate-800">Tratativa</h3>
                    {selectedTask.tratativa_id && (
                      <span className="text-xs font-mono bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-200 ml-2">
                        {selectedTask.tratativa_id}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-4">{selectedTask.tratativa}</p>
                  
                  {selectedTask.anexo_tratativa && (
                    <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg">
                      <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
                        <Icons.FileText /> {selectedTask.anexo_tratativa}
                      </span>
                      <button className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                        Baixar Arquivo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center">
                  <p className="text-sm text-slate-500 font-medium">Nenhuma tratativa registrada para esta tarefa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};