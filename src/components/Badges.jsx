import React from 'react';
import { Icons } from './Icons';

export const TypeBadge = ({ type }) => {
  const config = {
    'preventiva': { styles: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50', label: 'Preventiva', Icon: Icons.ShieldCheck },
    'corretiva': { styles: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50', label: 'Corretiva', Icon: Icons.Wrench },
    'vistoria': { styles: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50', label: 'Vistoria Técnica', Icon: Icons.Eye },
  };
  const val = (type || '').toLowerCase();
  let key = 'preventiva';
  if (val.includes('corretiva')) key = 'corretiva';
  else if (val.includes('vistoria')) key = 'vistoria';
  else if (val.includes('preventiva')) key = 'preventiva';
  
  const current = config[key] || config['preventiva'];
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border uppercase inline-flex items-center gap-1.5 transition-colors ${current.styles}`}>
      <current.Icon />{current.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const val = status || '';
  // Normalize string: convert to lower, remove accents, replace spaces with underscores
  const normalizedStatus = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_');
  
  const styles = {
    'em_andamento': 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    'concluido': 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    'pendente': 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    'aguardando_manutencao': 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    'aguardando': 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    'atrasado': 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  };
  
  const labels = { 
    'em_andamento': 'EM ANDAMENTO', 
    'concluido': 'CONCLUÍDO', 
    'pendente': 'PENDENTE', 
    'aguardando_manutencao': 'AGUARDANDO', 
    'aguardando': 'AGUARDANDO',
    'atrasado': 'ATRASADO' 
  };
  
  const currentStyle = styles[normalizedStatus] || styles['pendente'];
  const currentLabel = labels[normalizedStatus] || val.toUpperCase();

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 transition-colors ${currentStyle}`}>
      {normalizedStatus === 'concluido' ? <Icons.CheckCircle /> : (normalizedStatus === 'em_andamento' ? <Icons.Clock /> : null)}
      {currentLabel}
    </span>
  );
};

export const ContractBadge = ({ status }) => {
  const val = (status || '').toUpperCase();
  
  let styles = 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
  
  if (val.includes('SEM CONTRATO')) {
    styles = 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
  } else if (val.includes('GARANTIA')) {
    styles = 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1.5 uppercase tracking-wide transition-colors ${styles}`} title={status}>
      <Icons.FileText />{status || 'Sem Info'}
    </span>
  );
};

export const EqStatusBadge = ({ status }) => {
  const val = (status || '').toUpperCase().trim();
  
  let styles = 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
  let Icon = Icons.CheckCircle;
  let displayStatus = val || 'SEM INFO';

  if (val.includes('INOPERANTE') || val.includes('CONDENADO')) {
    styles = 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
    Icon = Icons.AlertCircle;
  } else if (val.includes('ANÁLISE') || val.includes('AVALIAÇÃO') || val.includes('MANUTENÇÃO') || val.includes('MANUTENCAO')) {
    styles = 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    Icon = Icons.Wrench;
  } else if (val.includes('PENDÊNCIA') || val.includes('PENDENCIA')) {
    styles = 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
    Icon = Icons.AlertCircle;
  } else if (val === 'OPERANTE' || val.includes('FUNCIONANDO')) {
    displayStatus = 'FUNCIONANDO';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 transition-colors ${styles}`} title={status}>
      <Icon />{displayStatus}
    </span>
  );
};
export const LicitacaoStatusBadge = ({ status }) => {
  const config = {
    'em_andamento': { styles: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', label: 'Em Andamento', Icon: Icons.Clock },
    'homologada': { styles: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', label: 'Homologada', Icon: Icons.CheckCircle },
    'deserta': { styles: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50', label: 'Deserta', Icon: Icons.AlertCircle },
    'suspensa': { styles: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', label: 'Suspensa', Icon: Icons.Wrench },
  };
  const current = config[status] || config['em_andamento'];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 transition-colors ${current.styles}`}>
      <current.Icon />{current.label}
    </span>
  );
};
