import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const UpdateTaskModal = ({ eq, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    tarefa: '',
    data_tarefa: '',
    observacoes_tarefa: '',
    status: 'AGUARDANDO',
    tratativa: '',
    data_tratativa: '',
    observacoes_tratativa: ''
  });

  useEffect(() => {
    if (eq) {
      setFormData({
        tarefa: eq.tarefa || '',
        data_tarefa: eq.data_tarefa || '',
        observacoes_tarefa: eq.observacoes_tarefa || '',
        status: eq.status || 'AGUARDANDO',
        tratativa: eq.tratativa || '',
        data_tratativa: eq.data_tratativa || '',
        observacoes_tratativa: eq.observacoes_tratativa || '',
        link_tarefa: eq.link_tarefa || '',
        link_tratativa: eq.link_tratativa || ''
      });
    }
  }, [eq]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...eq, ...formData });
  };

  if (!eq) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Atualizar Andamento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{eq.nome} | S/N: {eq.numero_serie}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Icons.X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <form id="update-task-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Bloco 1: Tarefa */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">1. Dados da Tarefa Original</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nº da Tarefa</label>
                  <input
                    type="text"
                    name="tarefa"
                    value={formData.tarefa}
                    onChange={handleChange}
                    placeholder="Ex: #123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data da Tarefa</label>
                  <input
                    type="date"
                    name="data_tarefa"
                    value={formData.data_tarefa}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações da Tarefa</label>
                <textarea
                  name="observacoes_tarefa"
                  value={formData.observacoes_tarefa}
                  onChange={handleChange}
                  placeholder="Descreva o que foi feito na tarefa principal..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Link Tarefa</label>
                <input
                  type="url"
                  name="link_tarefa"
                  value={formData.link_tarefa}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status da Máquina (Após Tarefa)</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="AGUARDANDO">AGUARDANDO</option>
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="CONCLUIDO">CONCLUÍDO</option>
                </select>
              </div>
            </div>

            {/* Bloco 2: Tratativa */}
            <div className="space-y-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">2. Dados da Tratativa (Opcional)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nº da Tratativa</label>
                  <input
                    type="text"
                    name="tratativa"
                    value={formData.tratativa}
                    onChange={handleChange}
                    placeholder="Ex: #123457"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data da Tratativa</label>
                  <input
                    type="date"
                    name="data_tratativa"
                    value={formData.data_tratativa}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações da Tratativa</label>
                <textarea
                  name="observacoes_tratativa"
                  value={formData.observacoes_tratativa}
                  onChange={handleChange}
                  placeholder="Descreva a solução da pendência..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Link Tratativa</label>
                <input
                  type="url"
                  name="link_tratativa"
                  value={formData.link_tratativa}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="update-task-form"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <Icons.Save size={18} /> Salvar Andamento
          </button>
        </div>
      </div>
    </div>
  );
};
