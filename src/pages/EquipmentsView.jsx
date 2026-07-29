import React from 'react';
import { Icons } from '../components/Icons';
import { ContractBadge, EqStatusBadge } from '../components/Badges';
import { DUMMY_EQUIPMENTS } from '../data/mockData';

export const EquipmentsView = () => {
  return (
    <div className="space-y-8">
      {/* Metrics for Equipments */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total de Equipamentos', value: '45', color: 'bg-white', text: 'text-slate-800', border: 'border-slate-200' },
          { label: 'Operantes', value: '38', color: 'bg-white', text: 'text-emerald-600', border: 'border-slate-200' },
          { label: 'Em Manutenção', value: '5', color: 'bg-white', text: 'text-amber-600', border: 'border-slate-200' },
          { label: 'Inoperantes', value: '2', color: 'bg-white', text: 'text-rose-600', border: 'border-slate-200' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl ${stat.color} border ${stat.border} shadow-sm hover:-translate-y-1 transition-transform duration-300 cursor-default group`}>
            <p className="text-sm font-medium text-slate-500 mb-2 group-hover:text-slate-700 transition-colors">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Icons.Monitor /> Inventário de Equipamentos
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Equipamento</th>
                <th className="px-6 py-4 font-medium">Unidade</th>
                <th className="px-6 py-4 font-medium">Contrato</th>
                <th className="px-6 py-4 font-medium">OS Atual</th>
                <th className="px-6 py-4 font-medium">Status Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {DUMMY_EQUIPMENTS.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 flex items-center gap-2"><Icons.Server /> {eq.type}</div>
                    <div className="text-xs text-slate-500 mt-1">{eq.serial} • {eq.model}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium"><Icons.MapPin /> {eq.unit}</td>
                  <td className="px-6 py-4"><ContractBadge status={eq.contract} /></td>
                  <td className="px-6 py-4">{eq.currentOS || '-'}</td>
                  <td className="px-6 py-4"><EqStatusBadge status={eq.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};