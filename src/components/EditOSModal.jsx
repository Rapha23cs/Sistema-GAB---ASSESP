import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const EditOSModal = ({ os, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ordem_servico: '',
    sei: '',
    tipo_servico: 'Preventiva',
    data_assinatura: '',
    processo: '',
    contrato: ''
  });

  useEffect(() => {
    if (os) {
      setFormData({
        ordem_servico: os.ordem_servico || '',
        sei: os.sei || '',
        tipo_servico: os.tipo_servico || 'Preventiva',
        data_assinatura: os.data_assinatura || '',
        processo: os.processo || '',
        contrato: os.contrato || '',
        link_ordem: os.link_ordem || ''
      });
    }
  }, [os]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.substring(0, 2) + "/" + v.substring(2);
    if (v.length > 5) v = v.substring(0, 5) + "/" + v.substring(5, 9);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: v
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!os) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.Edit /> Editar Informações Gerais da OS
          </h2>
          <button 
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Icons.X />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-os-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número da OS</label>
                <input 
                  required
                  name="ordem_servico" 
                  value={formData.ordem_servico} 
                  onChange={handleChange} 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" 
                  placeholder="Ex: OS-123/2026" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">SEI</label>
                <input 
                  name="sei" 
                  value={formData.sei} 
                  onChange={handleChange} 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Serviço</label>
                <select 
                  name="tipo_servico" 
                  value={formData.tipo_servico} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200"
                >
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                  <option value="Vistoria">Vistoria</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Assinatura</label>
                <input 
                  name="data_assinatura" 
                  value={formData.data_assinatura} 
                  onChange={handleDateChange} 
                  type="text" 
                  placeholder="Ex: 01/01/2026" 
                  maxLength={10}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200 font-mono" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Link Ordem</label>
                <input 
                  name="link_ordem" 
                  value={formData.link_ordem} 
                  onChange={handleChange} 
                  type="url" 
                  placeholder="https://..." 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Processo (Automático)</label>
                <input 
                  disabled
                  name="processo" 
                  value={formData.processo} 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contrato (Automático)</label>
                <input 
                  disabled
                  name="contrato" 
                  value={formData.contrato} 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed" 
                />
              </div>

            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="edit-os-form"
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Icons.Save /> Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
};
