import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { API_URL, apiFetch } from '../config';

export const ColaboracaoView = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [priority, setPriority] = useState('baixa');
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!selectedAssignee) {
      alert("Por favor, selecione para quem esta tarefa será atribuída.");
      return;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    
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
      alert('Erro ao criar tarefa');
      fetchTasks();
    }
  };

  const myPendingTasks = tasks.filter(t => !t.completed && t.assignee === (user?.nome || ''));

  return (
    <div className="space-y-6 flex h-[calc(100vh-140px)] gap-6">
      
      {/* Task Assignment Panel (Left) */}
      <div className="flex-[2] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col overflow-hidden transition-colors duration-500">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-500">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.MessageSquare /> Fórum e Tarefas (Atribuições)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Delegue ações e comunique-se com os outros usuários do sistema.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddTask} className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 transition-colors duration-500">
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Descreva a tarefa..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
            
            <div className="flex gap-3 items-center justify-between">
              <div className="flex gap-3 flex-1">
                <select 
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                >
                  <option value="" disabled>Atribuir para...</option>
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
          ) : tasks.length === 0 ? (
            <p className="text-center text-slate-500 my-8">Nenhuma tarefa encontrada.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`p-5 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm'}`}>
                <div className="flex gap-4 items-start">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 font-bold text-sm text-slate-600 dark:text-slate-300">
                    {task.author ? task.author.charAt(0).toUpperCase() : '?'}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{task.author}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm mx-2">atribuiu para</span>
                        <span className="font-bold text-purple-700 dark:text-purple-400">@{task.assignee}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{task.date}</span>
                    </div>
                    
                    <p className={`text-base leading-relaxed ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.text}
                    </p>
                    
                    {/* Actions / Status */}
                    <div className="mt-4 flex items-center gap-4">
                      <button 
                        onClick={() => toggleTask(task)}
                        disabled={task.rowNumber === -1}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border ${task.completed ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm'} ${task.rowNumber === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {task.completed ? <Icons.CheckSquare /> : <Icons.Square />}
                        {task.completed ? 'Tarefa Concluída (Check-out)' : 'Fazer Check-out'}
                      </button>
                      
                      {!task.completed && (
                        <span className={`text-xs px-2 py-1 rounded-md border uppercase tracking-wider font-bold ${task.priority === 'alta' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' : task.priority === 'media' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                          Prioridade {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Usuários Ativos no Sistema</h3>
          <div className="space-y-4">
            {activeUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
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
