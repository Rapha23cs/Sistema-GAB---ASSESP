import React, { useState } from 'react';
import { Icons } from './Icons';

export const GlobalSearch = ({ setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (module, keyName) => {
    if (!searchTerm.trim()) return;
    sessionStorage.setItem(keyName, searchTerm.trim());
    setSearchTerm('');
    setIsOpen(false);
    if (setActiveTab) setActiveTab(module);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        const val = searchTerm.trim().toLowerCase();
        if (val.includes('os') || val.includes('ordem') || /^\d+$/.test(val)) {
          handleSearch('Ordens', 'searchOS');
        } else if (val.includes('contrato') || val.includes('vmi') || val.includes('techscan')) {
          handleSearch('Contratos', 'searchContract');
        } else {
          handleSearch('Equipamentos', 'searchEquip');
        }
      }
    }
  };

  return (
    <div className="relative">
      <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        type="text"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Pesquisar no sistema..."
        className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all w-80 placeholder:text-slate-400 dark:text-slate-200 shadow-inner"
      />
      
      {isOpen && searchTerm.trim() && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden py-2 z-50 transform origin-top transition-all">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pesquisar "{searchTerm}" em...
            </div>
            
            <button 
              onClick={() => handleSearch('Ordens', 'searchOS')} 
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                <Icons.Briefcase className="w-4 h-4" /> 
              </div>
              Ordens de Serviço
            </button>
            
            <button 
              onClick={() => handleSearch('Equipamentos', 'searchEquip')} 
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="p-1.5 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-md">
                <Icons.Monitor className="w-4 h-4" /> 
              </div>
              Equipamentos
            </button>
            
            <button 
              onClick={() => handleSearch('Contratos', 'searchContract')} 
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
                <Icons.FileSignature className="w-4 h-4" /> 
              </div>
              Contratos
            </button>
          </div>
        </>
      )}
    </div>
  );
};
