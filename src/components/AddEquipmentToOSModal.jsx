import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const AddEquipmentToOSModal = ({ order, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    unidades: [],
    equipamentos: []
  });
  
  const [equipamentosDb, setEquipamentosDb] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/equipamentos`)
      .then(res => res.json())
      .then(data => setEquipamentosDb(data))
      .catch(err => console.error(err));
  }, []);

  const unidadesDisponiveis = [...new Set(equipamentosDb.filter(eq => eq.categoria === order.categoria && eq.unidade).map(eq => eq.unidade))].sort();

  const handleUnidadeSelect = (e) => {
    const selectedUnidade = e.target.value;
    if (selectedUnidade && !formData.unidades.includes(selectedUnidade)) {
      setFormData(prev => ({ ...prev, unidades: [...prev.unidades, selectedUnidade] }));
    }
    e.target.value = '';
  };

  const removeUnidade = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleEquipamentoSelect = (e) => {
    const selectedValue = e.target.value;
    const eq = equipamentosDb.find(item => `${item.categoria}-${item.id}` === selectedValue);
    
    if (eq && !formData.equipamentos.some(item => item.id === eq.id)) {
      setFormData(prev => ({ ...prev, equipamentos: [...prev.equipamentos, eq] }));
    }
    e.target.value = '';
  };

  const removeEquipamento = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.equipamentos.length === 0 && formData.unidades.length === 0) {
      alert("Selecione pelo menos um equipamento ou unidade para adicionar.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Icons.Plus size={20} className="text-blue-500" /> Adicionar Equipamentos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              OS: <span className="font-bold">{order.ordem_servico}</span> | Categoria: {order.categoria}
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-8">
          
          {/* Section 1: Unidades */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">1. Adicionar Unidade(s)</h4>
            <div className="space-y-4">
              <select
                onChange={handleUnidadeSelect}
                defaultValue=""
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 cursor-pointer"
              >
                <option value="" disabled>Selecione uma unidade para adicionar à OS...</option>
                {unidadesDisponiveis.map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>

              {formData.unidades.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-indigo-500 uppercase">Unidades Selecionadas</span>
                  {formData.unidades.map((uni, index) => (
                    <div key={index} className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-2.5 rounded-xl">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{uni}</span>
                      <button type="button" onClick={() => removeUnidade(index)} className="text-rose-500 hover:text-rose-700 p-1">
                        <Icons.X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Equipamentos */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">2. Adicionar Equipamento(s)</h4>
            <div className="space-y-4">
              <select
                onChange={handleEquipamentoSelect}
                defaultValue=""
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 cursor-pointer"
              >
                <option value="" disabled>Selecione um equipamento para adicionar à OS...</option>
                {equipamentosDb.filter(eq => {
                  if (eq.categoria !== order.categoria) return false;
                  if (formData.unidades.length > 0) {
                    return formData.unidades.includes(eq.unidade);
                  }
                  return true;
                }).map(eq => (
                  <option key={`${eq.categoria}-${eq.id}`} value={`${eq.categoria}-${eq.id}`}>
                    {eq.equipamento || eq.nome} - S/N: {eq.numero_serie} ({eq.unidade})
                  </option>
                ))}
              </select>
              
              {formData.equipamentos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-blue-500 uppercase">Equipamentos Selecionados</span>
                  {formData.equipamentos.map((eq, index) => (
                    <div key={index} className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-2.5 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{eq.equipamento || eq.nome}</span>
                        <span className="text-xs text-slate-500 mt-0.5">S/N: {eq.numero_serie || 'N/A'} | {eq.unidade}</span>
                      </div>
                      <button type="button" onClick={() => removeEquipamento(index)} className="text-rose-500 hover:text-rose-700 p-1">
                        <Icons.X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <Icons.Plus size={18} /> Adicionar à OS
          </button>
        </div>

      </div>
    </div>
  );
};
