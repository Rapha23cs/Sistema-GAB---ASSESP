import React from 'react';
import { Icons } from './Icons';

export const TypeBadge = ({ type }) => {
  const config = {
    'preventiva': { styles: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Preventiva', Icon: Icons.ShieldCheck },
    'corretiva': { styles: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Corretiva', Icon: Icons.Wrench },
    'vistoria': { styles: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Vistoria Técnica', Icon: Icons.Eye },
  };
  const current = config[type] || config['preventiva'];
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border uppercase inline-flex items-center gap-1.5 ${current.styles}`}>
      <current.Icon />{current.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    'em_andamento': 'bg-blue-50 text-blue-700 border-blue-200',
    'concluido': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'pendente': 'bg-amber-50 text-amber-700 border-amber-200',
    'atrasado': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const labels = { 'em_andamento': 'Em Andamento', 'concluido': 'Concluído', 'pendente': 'Pendente', 'atrasado': 'Atrasado' };
  
  const currentStyle = styles[status] || styles['pendente'];
  const currentLabel = labels[status] || status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${currentStyle}`}>
      {status === 'concluido' ? <Icons.CheckCircle /> : (status === 'em_andamento' ? <Icons.Clock /> : null)}
      {currentLabel}
    </span>
  );
};

export const ContractBadge = ({ status }) => {
  const config = {
    'com_contrato': { styles: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Com Contrato' },
    'sem_contrato': { styles: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Sem Contrato' },
    'garantia': { styles: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Em Garantia' },
  };
  const current = config[status] || config['sem_contrato'];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1.5 uppercase tracking-wide ${current.styles}`}>
      <Icons.FileText />{current.label}
    </span>
  );
};

export const EqStatusBadge = ({ status }) => {
  const config = {
    'operante': { styles: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Operante', Icon: Icons.CheckCircle },
    'inoperante': { styles: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Inoperante', Icon: Icons.AlertCircle },
    'manutencao': { styles: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Em Manutenção', Icon: Icons.Wrench },
  };
  const current = config[status] || config['inoperante'];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${current.styles}`}>
      <current.Icon />{current.label}
    </span>
  );
};
export const LicitacaoStatusBadge = ({ status }) => {
  const config = {
    'em_andamento': { styles: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Em Andamento', Icon: Icons.Clock },
    'homologada': { styles: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Homologada', Icon: Icons.CheckCircle },
    'deserta': { styles: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Deserta', Icon: Icons.AlertCircle },
    'suspensa': { styles: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Suspensa', Icon: Icons.Wrench },
  };
  const current = config[status] || config['em_andamento'];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${current.styles}`}>
      <current.Icon />{current.label}
    </span>
  );
};
