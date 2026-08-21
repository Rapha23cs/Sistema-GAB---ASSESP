import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import toast from 'react-hot-toast';
import { API_URL, apiFetch } from '../config';
import { formatDateBr } from '../utils/dateUtils';

import { useAuth } from '../contexts/AuthContext';

export const ColaboracaoView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [priority, setPriority] = useState('baixa');
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [userFilter, setUserFilter] = useState(null);
  const [dismissedAvisos, setDismissedAvisos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`dismissedAlerts_${user?.nome || 'default'}`)) || [];
    } catch {
      return [];
    }
  });

  const dismissAviso = async (task) => {
    const taskId = task.id || task.rowNumber;
    const alertId = `aviso_${taskId}`;
    if (!dismissedAvisos.includes(alertId)) {
      const updated = [...dismissedAvisos, alertId];
      setDismissedAvisos(updated);
      localStorage.setItem(`dismissedAlerts_${user?.nome || 'default'}`, JSON.stringify(updated));
      window.dispatchEvent(new Event('alertsUpdated'));
    }

    if (task.rowNumber !== -1 && !task.comentarios?.some(c => c.isCiente && c.autor === user?.nome)) {
      try {
        await apiFetch(`${API_URL}/api/tarefas/${task.rowNumber}/comentarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCiente: true, autor: user?.nome || 'Usuário', data: formatDateBr(new Date()) })
        });
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Busca usuários para popular o painel lateral e o dropdown de atribuição
  const fetchUsers = async () => {
    try {
      const res = await apiFetch(`${API_URL}/api/auth/users`);
      if (res.ok) {
        const users = await res.json();
        // Filtra apenas os usuários aprovados
        setActiveUsers(users.filter(u => u.status?.toLowerCase() === 'aprovado'));
      }
    } catch (err) {
      console.error('Erro ao buscar usuários', err);
    }
  };

  // Busca as tarefas
  const fetchTasks = async () => {
    try {
      const res = await apiFetch(`${API_URL}/api/tarefas?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleSearchTask = () => {
      const searchTask = sessionStorage.getItem('searchTask');
      if (searchTask && tasks.length > 0) {
        setHighlightedTaskId(searchTask);
        sessionStorage.removeItem('searchTask');
        setTimeout(() => {
          const el = document.getElementById(`task-${searchTask}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => setHighlightedTaskId(null), 3000); // Remove highlight after 3 seconds
          }
        }, 100);
      }
    };

    window.addEventListener('searchTaskUpdated', handleSearchTask);
    
    if (!isLoading) {
      handleSearchTask();
    }

    return () => {
      window.removeEventListener('searchTaskUpdated', handleSearchTask);
    };
  }, [isLoading, tasks]);

  useEffect(() => {
    const handleAlertsUpdated = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(`dismissedAlerts_${user?.nome || 'default'}`)) || [];
        setDismissedAvisos(stored);
      } catch (e) {
        console.error('Error parsing dismissedAlerts', e);
      }
    };
    window.addEventListener('alertsUpdated', handleAlertsUpdated);
    return () => window.removeEventListener('alertsUpdated', handleAlertsUpdated);
  }, [user]);

  const toggleTask = async (task) => {
    try {
      // Toggle optimista na UI
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ));
      
      const res = await apiFetch(`${API_URL}/api/tarefas/${task.rowNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      
      if (!res.ok) {
        // Reverte se falhar
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      // Optimistic delete
      setTasks(prev => prev.filter(t => t.id !== task.id));
      
      const res = await apiFetch(`${API_URL}/api/tarefas/${task.rowNumber}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!selectedAssignee) {
      toast.error("Por favor, selecione para quem esta tarefa será atribuída.");
      return;
    }
    
    const now = new Date();
    const dateStr = formatDateBr(now);
    
    const taskObj = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      text: newTask,
      author: user?.nome || 'Usuário Desconhecido',
      assignee: selectedAssignee,
      date: dateStr,
      priority: priority
    };
    
    // Atualiza optimisticamente
    setTasks([{...taskObj, completed: false, rowNumber: -1}, ...tasks]);
    setNewTask('');
    setSelectedAssignee('');
    setPriority('baixa');

    try {
      await apiFetch(`${API_URL}/api/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskObj)
      });
      // Busca a lista atualizada para pegar os IDs e rowNumbers reais do Google Sheets
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar tarefa');
      fetchTasks();
    }
  };

  const myPendingTasks = tasks.filter(t => !t.completed && t.assignee === (user?.nome || ''));

  const submitComment = async (task) => {
    const text = commentInputs[task.id];
    if (!text || !text.trim()) return;

    const newComment = {
      texto: text,
      autor: user?.nome || 'Usuário Desconhecido',
      data: formatDateBr(new Date())
    };

    // Optimistic UI update
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return { ...t, comentarios: [...(t.comentarios || []), { ...newComment, id: 'temp' }] };
      }
      return t;
    }));
    setCommentInputs(prev => ({ ...prev, [task.id]: '' }));

    try {
      await apiFetch(`${API_URL}/api/tarefas/${task.rowNumber}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao adicionar comentário');
      fetchTasks();
    }
  };

  const toggleComments = (taskId) => {
    setExpandedComments(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCommentChange = (taskId, text) => {
    setCommentInputs(prev => ({ ...prev, [taskId]: text }));
  };

  return (
    <div className="space-y-6 flex h-[calc(100vh-140px)] gap-6">
      
      {/* Task Assignment Panel (Left) */}
      <div className="flex-[2] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col overflow-hidden transition-colors duration-500">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-500 flex justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Icons.MessageSquare /> Fórum e Tarefas (Atribuições)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Delegue ações e comunique-se com os outros usuários do sistema.</p>
          </div>
          <button
            onClick={fetchTasks}
            className="px-4 h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            title="Atualizar Dados"
          >
            <Icons.RefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddTask} className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 transition-colors duration-500">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                Nova Tarefa ou Aviso
              </label>
              <textarea 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Descreva a tarefa ou mensagem com detalhes..."
                rows={3}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm resize-none"
              />
            </div>
            
            <div className="flex gap-3 items-center justify-between">
              <div className="flex gap-3 flex-1">
                <select 
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                >
                  <option value="" disabled>Atribuir para / Tipo de Post</option>
                  <option value="Todos" className="font-bold text-emerald-600">Aviso Geral (Todos)</option>
                  {activeUsers.filter(u => u.nome !== user?.nome).map(u => (
                    <option key={u.id} value={u.nome}>{u.nome}</option>
                  ))}
                </select>

                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                >
                  <option value="baixa">Prioridade Baixa</option>
                  <option value="media">Prioridade Média</option>
                  <option value="alta">Prioridade Alta</option>
                </select>
              </div>

              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
                <Icons.Plus /> Atribuir
              </button>
            </div>
          </div>
        </form>

        {/* Task Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <p className="text-center text-slate-500 my-8">Carregando tarefas...</p>
          ) : tasks.filter(t => !userFilter || t.assignee === userFilter).length === 0 ? (
            <p className="text-center text-slate-500 my-8">
              {userFilter ? `Nenhuma tarefa atribuída a ${userFilter}.` : 'Nenhuma tarefa encontrada.'}
            </p>
          ) : (
            tasks.filter(t => !userFilter || t.assignee === userFilter).map((task) => {
              const isHighlighted = String(highlightedTaskId) === String(task.id) || String(highlightedTaskId) === String(task.rowNumber);
              const taskDomId = task.id || task.rowNumber;
              return (
              <div 
                key={task.id || task.rowNumber} 
                id={`task-${taskDomId}`}
                className={`p-5 rounded-2xl border transition-all duration-500 ${
                  isHighlighted 
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500 shadow-md ring-2 ring-blue-500/50 transform scale-[1.02] z-10 relative' 
                    : task.completed 
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm'
                }`}
              >
                <div className="flex gap-4 items-start">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 font-bold text-sm text-slate-600 dark:text-slate-300">
                    {task.author ? task.author.charAt(0).toUpperCase() : '?'}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        {task.assignee === 'Todos' ? (
                          <>
                            <span className="font-bold text-blue-700 dark:text-blue-400">{task.author}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm mx-2">publicou um</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Aviso Geral</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-blue-700 dark:text-blue-400">{task.author}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm mx-2">atribuiu para</span>
                            <span className="font-bold text-purple-700 dark:text-purple-400">@{task.assignee}</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{task.date}</span>
                    </div>
                    
                    <p className={`text-base leading-relaxed ${(task.completed && task.assignee !== 'Todos') ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.text}
                    </p>
                    
                    {/* Actions / Status */}
                    <div className="mt-4 flex items-center gap-4">
                      {task.assignee === 'Todos' ? (() => {
                        const isCiente = task.comentarios?.some(c => c.isCiente && c.autor === user?.nome) || dismissedAvisos.includes(`aviso_${task.id || task.rowNumber}`);
                        const cientesList = (task.comentarios || []).filter(c => c.isCiente);
                        return (
                          <>
                            {isCiente ? (
                              <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 opacity-70">
                                 <Icons.CheckSquare /> Ciente
                              </div>
                            ) : (
                              <button 
                                onClick={() => dismissAviso(task)}
                                className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 shadow-sm"
                              >
                                <Icons.Square /> Marcar como Ciente
                              </button>
                            )}
                            
                            {cientesList.length > 0 && (
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-slate-500 font-medium">Visto por:</span>
                                <div className="flex -space-x-2 overflow-hidden" title={cientesList.map(c => c.autor).join(', ')}>
                                  {cientesList.slice(0, 5).map((c, idx) => (
                                    <div key={idx} className="inline-block h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 relative z-10" style={{ zIndex: 10 - idx }}>
                                      {c.autor.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                  {cientesList.length > 5 && (
                                    <div className="inline-block h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500 relative z-0" style={{ zIndex: 0 }}>
                                      +{cientesList.length - 5}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })() : (
                        user?.nome === task.assignee ? (
                          <button 
                            onClick={() => toggleTask(task)}
                            disabled={task.rowNumber === -1}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border ${task.completed ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm'} ${task.rowNumber === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {task.completed ? <Icons.CheckSquare /> : <Icons.Square />}
                            {task.completed ? 'Tarefa Concluída (Check-out)' : 'Fazer Check-out'}
                          </button>
                        ) : (
                          <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border ${task.completed ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'}`}>
                             {task.completed ? <Icons.CheckSquare /> : <Icons.Square />}
                             {task.completed ? 'Concluída' : 'Aguardando ' + task.assignee}
                          </div>
                        )
                      )}
                      
                      {!task.completed && task.assignee !== 'Todos' && (
                        <span className={`text-xs px-2 py-1 rounded-md border uppercase tracking-wider font-bold ${task.priority === 'alta' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' : task.priority === 'media' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                          Prioridade {task.priority}
                        </span>
                      )}

                      {task.rowNumber !== -1 && (
                        <button
                          onClick={() => toggleComments(task.id)}
                          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Icons.MessageSquare className="w-4 h-4" />
                          {task.comentarios?.filter(c => !c.isCiente).length || 0} {(task.comentarios?.filter(c => !c.isCiente).length === 1) ? 'Comentário' : 'Comentários'}
                        </button>
                      )}

                      {user?.nome === task.author && (
                        <button
                          onClick={() => handleDeleteTask(task)}
                          disabled={task.rowNumber === -1}
                          className="ml-auto flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          title="Excluir Tarefa"
                        >
                          <Icons.Trash2 /> Excluir
                        </button>
                      )}
                    </div>
                    
                    {/* Comments Section */}
                    {expandedComments[task.id] && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        {/* List of comments */}
                        <div className="space-y-3 mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                          {(task.comentarios || []).filter(c => !c.isCiente).map((c, i) => (
                            <div key={c.id || i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{c.autor}</span>
                                <span className="text-xs text-slate-400">{c.data}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{c.texto}</p>
                            </div>
                          ))}
                          {(!task.comentarios || task.comentarios.filter(c => !c.isCiente).length === 0) && (
                            <p className="text-sm text-slate-500 text-center italic">Nenhum comentário ainda.</p>
                          )}
                        </div>
                        
                        {/* Add comment form */}
                        <div className="flex gap-2 items-start mt-2">
                          <textarea
                            rows={1}
                            placeholder={task.completed ? "Tarefa concluída (comentários desativados)" : "Escreva uma atualização ou justificativa..."}
                            value={commentInputs[task.id] || ''}
                            onChange={(e) => handleCommentChange(task.id, e.target.value)}
                            disabled={task.completed}
                            className={`flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[40px] ${task.completed ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : ''}`}
                          />
                          <button
                            onClick={() => submitComment(task)}
                            disabled={task.completed || !commentInputs[task.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center shrink-0 min-h-[40px]"
                          >
                            <Icons.Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>

      {/* Analytics / Side Panel (Right) */}
      <div className="flex-[1] flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-500">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Minhas Tarefas Pendentes</h3>
          <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">{myPendingTasks.length}</div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Atribuídas a {user?.nome || 'Você'}.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex-1 transition-colors duration-500">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex justify-between items-center">
            Usuários Ativos no Sistema
            {userFilter && (
              <span 
                onClick={() => setUserFilter(null)}
                className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer normal-case bg-blue-50 px-2 py-1 rounded-md"
              >
                Limpar filtro
              </span>
            )}
          </h3>
          <div className="space-y-2">
            <div 
              onClick={() => setUserFilter(userFilter === 'Todos' ? null : 'Todos')}
              className={`flex items-center gap-3 group cursor-pointer p-2 rounded-xl transition-colors ${userFilter === 'Todos' ? 'bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-500/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Icons.MessageSquare size={16} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">Avisos Gerais</span>
                <span className="text-[10px] text-slate-400 uppercase">Ver todos os anúncios</span>
              </div>
            </div>
            
            <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>

            {activeUsers.map((u) => (
              <div 
                key={u.id} 
                onClick={() => setUserFilter(userFilter === u.nome ? null : u.nome)}
                className={`flex items-center gap-3 group cursor-pointer p-2 rounded-xl transition-colors ${userFilter === u.nome ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} title={u.isOnline ? 'Online' : 'Offline'}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{u.nome}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{u.role}</span>
                </div>
              </div>
            ))}
            {activeUsers.length === 0 && (
              <p className="text-sm text-slate-500">Buscando usuários...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
