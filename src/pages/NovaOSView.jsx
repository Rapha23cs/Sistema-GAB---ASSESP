import { apiFetch } from '../config';
import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';

export const NovaOSView = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    categoria: 'Esteira Raio-x',
    ordem_servico: '',
    contrato: 'N° 056/2026 - TECHSCAN', // Initial value for Esteira
    processo: '',
    sei: '',
    tipo_servico: 'MANUTENÇÃO PREVENTIVA',
    unidade: '', // we will replace this with unidades array
    unidades: [],
    data_assinatura: '',
    link_ordem: '',
    equipamentos: [],
    status: 'AGUARDANDO',
    cronograma: ''
  });

  const [contratosDb, setContratosDb] = useState([]);
  const [equipamentosDb, setEquipamentosDb] = useState([]);

  useEffect(() => {
    apiFetch(`${API_URL}/api/contratos`)
      .then(res => res.json())
      .then(data => {
        setContratosDb(data);
        // Set initial processo based on default categoria
        setFormData(prev => ({ ...prev, processo: '02406/2025' }));
      })
      .catch(err => console.error(err));
      
    apiFetch(`${API_URL}/api/equipamentos`)
      .then(res => res.json())
      .then(data => setEquipamentosDb(data))
      .catch(err => console.error(err));
  }, []);

  const unidadesDisponiveis = [...new Set(equipamentosDb.filter(eq => eq.categoria === formData.categoria && eq.unidade).map(eq => eq.unidade))].sort();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'data_assinatura') {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{4})\d+?$/, '$1');
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: formattedValue };
      if (name === 'categoria') {
        const numContrato = value === 'Bodyscan' ? 'N° 002/2024 - VMI' : 'N° 056/2026 - TECHSCAN';
        newData.contrato = numContrato;
        
        let processoVal = value === 'Bodyscan' ? '167633/2023' : '02406/2025';
        
        newData.processo = processoVal;
        newData.equipamentos = [];
        newData.unidades = [];
      }
      return newData;
    });
  };

  const handleEquipamentoSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const eq = equipamentosDb.find(eq => `${eq.categoria}-${eq.id}` === selectedId);
    if (eq) {
      setFormData(prev => {
        const eqExists = prev.equipamentos.find(item => item.id === eq.id && item.categoria === eq.categoria);
        if (eqExists) return prev;

        return {
          ...prev,
          categoria: eq.categoria === 'Bodyscan' ? 'Bodyscan' : 'Esteira Raio-x',
          equipamentos: [...prev.equipamentos, {
            id: eq.id,
            categoria: eq.categoria,
            equipamento: eq.equipamento || eq.nome || '',
            modelo: eq.modelo || '',
            numero_serie: eq.numero_serie || '',
            unidade: eq.unidade || prev.unidade
          }]
        };
      });
      // Reseta o select para permitir adicionar outros
      e.target.value = '';
    }
  };

  const removeEquipamento = (index) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.filter((_, i) => i !== index)
    }));
  };

  const handleOsNumberBlur = (e) => {
    let val = e.target.value.trim();
    if (!val) return;
    const parts = val.split('/');
    if (parts.length === 2) {
      const [num, year] = parts;
      if (num.length > 0 && num.length < 3 && !isNaN(num)) {
        const padded = num.padStart(3, '0');
        setFormData(prev => ({ ...prev, ordem_servico: `${padded}/${year}` }));
      }
    }
  };

  const handleUnidadeSelect = (e) => {
    const selectedUnidade = e.target.value;
    if (!selectedUnidade) return;
    setFormData(prev => {
      if (prev.unidades.includes(selectedUnidade)) return prev;
      return {
        ...prev,
        unidades: [...prev.unidades, selectedUnidade]
      };
    });
    e.target.value = '';
  };

  const removeUnidade = (index) => {
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-500">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 transition-colors duration-500">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icons.FileText /> Nova Ordem de Serviço
        </h2>
        <button type="button" onClick={onCancel} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <Icons.X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">

        {/* Section 1: Dados Gerais */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">1. Dados Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria (Aba do Sheets)</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200">
                <option value="Esteira Raio-x">Esteira Raio-x</option>
                <option value="Bodyscan">Bodyscan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número da OS</label>
              <input required name="ordem_servico" value={formData.ordem_servico} onChange={handleChange} onBlur={handleOsNumberBlur} type="text" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" placeholder="Ex: 123/2026" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Serviço</label>
              <select name="tipo_servico" value={formData.tipo_servico} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200">
                <option value="MANUTENÇÃO PREVENTIVA">MANUTENÇÃO PREVENTIVA</option>
                <option value="MANUTENÇÃO CORRETIVA">MANUTENÇÃO CORRETIVA</option>
                <option value="VISTORIA">VISTORIA</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Assinatura</label>
              <input name="data_assinatura" value={formData.data_assinatura} onChange={handleChange} type="text" placeholder="Ex: 01/01/2026" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Link Ordem</label>
              <input name="link_ordem" value={formData.link_ordem} onChange={handleChange} type="url" placeholder="https://..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contrato (Automático)</label>
              <input readOnly name="contrato" value={formData.contrato} type="text" className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Processo (Automático)</label>
              <input readOnly name="processo" value={formData.processo} type="text" className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">SEI</label>
              <input name="sei" value={formData.sei} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 dark:text-slate-200" />
            </div>
          </div>
        </div>

        {/* Section 2: Unidades */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">2. Unidade(s) Envolvida(s)</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Autocompletar Unidades (Filtradas por Categoria)</label>
              <select
                onChange={handleUnidadeSelect}
                defaultValue=""
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 cursor-pointer"
              >
                <option value="" disabled>Selecione para adicionar uma unidade à OS...</option>
                {unidadesDisponiveis.map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>
            </div>
            {formData.unidades.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unidades Selecionadas ({formData.unidades.length})</span>
                {formData.unidades.map((uni, index) => (
                  <div key={index} className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-3 rounded-xl transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{uni}</span>
                    <button type="button" onClick={() => removeUnidade(index)} className="text-rose-500 hover:text-rose-700 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg transition-colors">
                      <Icons.X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Equipamentos */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">3. Equipamento(s)</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Autocompletar Equipamentos (Filtrados por Categoria)</label>
              <select
                onChange={handleEquipamentoSelect}
                defaultValue=""
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 cursor-pointer"
              >
                <option value="" disabled>Selecione para adicionar um equipamento à OS...</option>
                {equipamentosDb.filter(eq => {
                  if (eq.categoria !== formData.categoria) return false;
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
            </div>
            
            {formData.equipamentos.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Equipamentos Selecionados ({formData.equipamentos.length})</span>
                {formData.equipamentos.map((eq, index) => (
                  <div key={index} className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-3 rounded-xl transition-all hover:border-blue-300 dark:hover:border-blue-700">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{eq.equipamento}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mod: {eq.modelo} | S/N: {eq.numero_serie || 'N/A'}</span>
                    </div>
                    <button type="button" onClick={() => removeEquipamento(index)} className="text-rose-500 hover:text-rose-700 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg transition-colors">
                      <Icons.X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formData.equipamentos.length === 0 && (
              <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum equipamento adicionado. Use o campo acima para buscar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
            <Icons.Save /> Salvar OS
          </button>
        </div>

      </form>
    </div>
  );
};
