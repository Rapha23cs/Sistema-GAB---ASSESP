import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { DUMMY_TASKS } from '../data/mockData';

export const ColaboracaoView = () => {
  const [tasks, setTasks] = useState(DUMMY_TASKS);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const taskObj = {
      id: `TSK-0${tasks.length + 1}`,
      text: newTask,
      author: 'Raphael S.',
      assignee: 'Equipe de Manutenção',
      date: 'Hoje',
      completed: false,
      priority: 'media'
    };
    
    setTasks([taskObj, ...tasks]);
    setNewTask('');
  };

  return (
    <div className="space-y-6 flex h-[calc(100vh-140px)] gap-6">
      
      {/* Task Assignment Panel (Left) */}
      <div className="flex-[2] bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Icons.MessageSquare /> Fórum e Tarefas (Atribuições)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Delegue ações e comunique-se com os outros usuários do sistema.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddTask} className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Descreva a tarefa e atribua (ex: @Mariana atualizar OS...)"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
            />
            <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <Icons.Plus /> Atribuir
            </button>
          </div>
        </form>

        {/* Task Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className={`p-5 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
              <div className="flex gap-4 items-start">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 font-bold text-sm text-slate-600">
                  {task.author.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-blue-700">{task.author}</span>
                      <span className="text-slate-500 text-sm mx-2">atribuiu para</span>
                      <span className="font-bold text-purple-700">@{task.assignee}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{task.date}</span>
                  </div>
                  
                  <p className={`text-base leading-relaxed ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.text}
                  </p>
                  
                  {/* Actions / Status */}
                  <div className="mt-4 flex items-center gap-4">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border ${task.completed ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-slate-500 border-slate-300 hover:text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                    >
                      {task.completed ? <Icons.CheckSquare /> : <Icons.Square />}
                      {task.completed ? 'Tarefa Concluída (Check-out)' : 'Fazer Check-out'}
                    </button>
                    
                    {!task.completed && (
                      <span className={`text-xs px-2 py-1 rounded-md border uppercase tracking-wider font-bold ${task.priority === 'alta' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        Prioridade {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics / Side Panel (Right) */}
      <div className="flex-[1] flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Minhas Tarefas Pendentes</h3>
          <div className="text-4xl font-bold text-slate-800 mb-2">{tasks.filter(t => !t.completed).length}</div>
          <p className="text-sm text-slate-600">Mantenha seu fluxo de trabalho em dia.</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Usuários Ativos</h3>
          <div className="space-y-4">
            {['Raphael S.', 'Mariana Costa', 'Carlos Almeida', 'Roberto Silva'].map((user, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
                    {user.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
