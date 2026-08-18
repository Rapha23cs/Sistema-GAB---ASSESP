import React from 'react';
import { Icons } from '../Icons';

export const LicitacoesModal = ({ isOpen, onClose, onSave, formData, handleInputChange, editingId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {editingId ? <Icons.Edit /> : <Icons.Plus />}
            {editingId ? 'Editar Processo' : 'Novo Processo Licitatório'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
            <Icons.X />
          </button>
        </div>
        
        <form onSubmit={onSave} id="licitacoesForm" className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Processo Original (SEI)</label>
              <input required name="processo_original" value={formData.processo_original} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Processos de Autorização (Governo)</label>
              <input name="processo_autorizacao" value={formData.processo_autorizacao} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">StarGov N°</label>
              <input name="stargov" value={formData.stargov} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Memo de Abertura</label>
              <input name="memo" value={formData.memo} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modalidade</label>
              <select name="modalidade" value={formData.modalidade} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200">
                <option value="">Selecione...</option>
                <option value="PREGÃO">PREGÃO (comum)</option>
                <option value="INEXIGIBILIDADE">INEXIGIBILIDADE</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Objeto</label>
            <textarea name="objeto" rows="2" value={formData.objeto} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custeio/Recurso</label>
              <input name="custeio" value={formData.custeio} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Previsto (R$)</label>
              <input name="valor_previsto" value={formData.valor_previsto} onChange={handleInputChange} placeholder="Ex: R$ 1.500,00" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade</label>
              <input name="quantidade" value={formData.quantidade} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <input name="status" value={formData.status} onChange={handleInputChange} placeholder="Ex: Em andamento, Aguardando..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Localização</label>
              <input name="localizacao" value={formData.localizacao} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
              <input name="data" value={formData.data} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Objeto</label>
            <select name="tipo_objeto" value={formData.tipo_objeto} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200">
              <option value="">Selecione</option>
              <option value="Aquisição">Aquisição</option>
              <option value="Serviço">Serviço</option>
            </select>
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onSave}
            type="submit"
            form="licitacoesForm"
            className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Icons.Save /> {editingId ? 'Salvar Alterações' : 'Criar Processo'}
          </button>
        </div>
      </div>
    </div>
  );
};
