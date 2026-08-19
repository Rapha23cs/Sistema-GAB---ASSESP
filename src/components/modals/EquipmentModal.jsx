import React from 'react';
import { Icons } from '../Icons';

export const EquipmentModal = ({
  isOpen,
  onClose,
  onSave,
  formData,
  handleInputChange,
  editingId,
  unidades,
  modelos,
  coberturas
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.Plus /> {editingId ? 'Editar Equipamento' : 'Cadastrar Novo Equipamento'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer">
            <Icons.X />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tipo de Equipamento (Categoria) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Equipamento (Aba)</label>
              <select name="categoria" value={formData.categoria} onChange={handleInputChange} disabled={!!editingId} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <option value="Esteira Raio-x">Esteira Raio-x</option>
                <option value="Bodyscan">Bodyscan</option>
                <option value="Pórticos">Pórticos</option>
              </select>
            </div>

            {/* Equipamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipamento</label>
              <input name="equipamento" value={formData.equipamento} onChange={handleInputChange} type="text" placeholder="Ex: Esteira Raio-X" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>

            {/* Unidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Unidade</label>
              <input name="unidade" list="unidades-list" value={formData.unidade} onChange={handleInputChange} type="text" placeholder="Ex: Presídio Central" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
              <datalist id="unidades-list">
                {unidades.map((u, i) => <option key={i} value={u} />)}
              </datalist>
            </div>

            {/* Localidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Localidade</label>
              <input name="localidade" value={formData.localidade} onChange={handleInputChange} type="text" placeholder="Ex: Portaria Principal" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
              <input name="modelo" list="modelos-list" value={formData.modelo} onChange={handleInputChange} type="text" placeholder="Ex: Rapiscan 620XR" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
              <datalist id="modelos-list">
                {modelos.map((m, i) => <option key={i} value={m} />)}
              </datalist>
            </div>

            {/* Número de Série */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Série</label>
              <input name="numero_serie" value={formData.numero_serie} onChange={handleInputChange} type="text" placeholder="Ex: SN-XR-88902" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>

            {/* Cobertura de Contrato */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cobertura de Contrato</label>
              <input name="cobertura_contrato" list="coberturas-list" value={formData.cobertura_contrato} onChange={handleInputChange} type="text" placeholder="Ex: Empresa X / Com Contrato" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
              <datalist id="coberturas-list">
                {coberturas.map((c, i) => <option key={i} value={c} />)}
              </datalist>
            </div>

            {/* Data de Garantia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Garantia</label>
              <input name="data_garantia" value={formData.data_garantia || ''} onChange={handleInputChange} type="text" placeholder="Ex: 10/10/2026 ou 12 meses" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>

            {/* Ordem de Serviço Atual */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ordem de Serviço (atual)</label>
              <input name="ordem_servico" value={formData.ordem_servico} onChange={handleInputChange} type="text" placeholder="Ex: OS 123/24" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>

            {/* Status de Funcionamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Operacional</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 cursor-pointer">
                <option value="">Selecione...</option>
                <option value="Operante">Operante</option>
                <option value="Funcionando com Pendência">Funcionando com Pendência</option>
                <option value="Inoperante">Inoperante</option>
              </select>
            </div>
            
            {/* Informações/Pendências */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Informações / Pendências</label>
              <textarea name="informacoes_pendencias" value={formData.informacoes_pendencias} onChange={handleInputChange} placeholder="Ex: Aguardando peça..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 min-h-[100px]" />
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={onSave} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Icons.CheckSquare /> {editingId ? 'Atualizar Equipamento' : 'Salvar Equipamento'}
          </button>
        </div>
      </div>
    </div>
  );
};
