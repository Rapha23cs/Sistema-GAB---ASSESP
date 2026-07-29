import React, { useState } from 'react';
import { Icons } from '../components/Icons';

export const NovaOSView = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    numero_os: '',
    contrato: '',
    processo: '',
    sei: '',
    tipo_servico: 'Preventiva',
    unidade: '',
    data_assinatura: '',
    status: 'Aberta',
    cronograma: ''
  });

  const [equipamentos, setEquipamentos] = useState([]);
  const [novoEquipamento, setNovoEquipamento] = useState({
    nome: '',
    modelo: '',
    numero_serie: ''
  });

  const [tarefas, setTarefas] = useState([]);
  const [tarefaId, setTarefaId] = useState('');
  const [novaTarefa, setNovaTarefa] = useState('');
  const [dataExecucao, setDataExecucao] = useState('');
  const [tarefaEquipamento, setTarefaEquipamento] = useState('');

  const [tratativaId, setTratativaId] = useState('');
  const [novaTratativa, setNovaTratativa] = useState('');
  const [novoAnexoTarefa, setNovoAnexoTarefa] = useState(null);
  const [novoAnexoTratativa, setNovoAnexoTratativa] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEquipamento = (e) => {
    e.preventDefault();
    if (!novoEquipamento.nome.trim()) return;
    setEquipamentos(prev => [...prev, { ...novoEquipamento, id: Date.now().toString() }]);
    setNovoEquipamento({ nome: '', modelo: '', numero_serie: '' });
  };

  const handleRemoveEquipamento = (id) => {
    setEquipamentos(prev => prev.filter(e => e.id !== id));
    // Se removermos um equipamento, talvez precisemos limpar a seleção atual se for o mesmo
  };

  const handleAddTarefa = (e) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;
    if (!tarefaId.trim()) {
      alert("Por favor, preencha o ID da Tarefa.");
      return;
    }

    setTarefas(prev => [...prev, {
      id: tarefaId.trim(),
      descricao: novaTarefa,
      data_tarefa: dataExecucao || new Date().toLocaleDateString('pt-BR'),
      equipamento_nome: tarefaEquipamento || null,
      observacoes: '',
      concluida: false,
      tratativa: novaTratativa.trim() || null,
      tratativa_id: novaTratativa.trim() ? tratativaId.trim() : null,
      anexo_tarefa: novoAnexoTarefa ? novoAnexoTarefa.name : null,
      anexo_tratativa: novoAnexoTratativa ? novoAnexoTratativa.name : null
    }]);

    setTarefaId('');
    setNovaTarefa('');
    setDataExecucao('');
    setTarefaEquipamento('');

    setTratativaId('');
    setNovaTratativa('');
    setNovoAnexoTarefa(null);
    setNovoAnexoTratativa(null);
  };

  const handleRemoveTarefa = (id) => {
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, equipamentos, tarefas });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Icons.FileText /> Nova Ordem de Serviço
        </h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
          <Icons.X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">

        {/* Section 1: Dados Gerais */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">1. Dados Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Número da OS</label>
              <input required name="numero_os" value={formData.numero_os} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800" placeholder="Ex: OS-123/2026" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Serviço</label>
              <select name="tipo_servico" value={formData.tipo_servico} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800">
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Vistoria">Vistoria</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Assinatura</label>
              <input name="data_assinatura" value={formData.data_assinatura} onChange={handleChange} type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contrato</label>
              <input name="contrato" value={formData.contrato} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800" placeholder="Ex: CT-012/2026" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Processo</label>
              <input name="processo" value={formData.processo} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Unidade (Local)</label>
              <input required name="unidade" value={formData.unidade} onChange={handleChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800" placeholder="Ex: Sede Administrativa" />
            </div>
          </div>
        </div>

        {/* Section 2: Equipamentos */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">2. Equipamentos</h3>

          <div className="space-y-3 mb-4">
            {equipamentos.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm text-center">
                Nenhum equipamento adicionado.
              </div>
            ) : (
              equipamentos.map((eq, index) => (
                <div key={eq.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{eq.nome}</span>
                    <span className="text-xs text-slate-500">Modelo: {eq.modelo || 'N/A'} | S/N: {eq.numero_serie || 'N/A'}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveEquipamento(eq.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                    <Icons.Trash2 />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <input
                value={novoEquipamento.nome}
                onChange={e => setNovoEquipamento(prev => ({ ...prev, nome: e.target.value }))}
                type="text" placeholder="Nome do Equipamento"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-1">
              <input
                value={novoEquipamento.modelo}
                onChange={e => setNovoEquipamento(prev => ({ ...prev, modelo: e.target.value }))}
                type="text" placeholder="Modelo"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-1">
              <input
                value={novoEquipamento.numero_serie}
                onChange={e => setNovoEquipamento(prev => ({ ...prev, numero_serie: e.target.value }))}
                type="text" placeholder="Nº de Série"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="col-span-1 md:col-span-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddEquipamento}
                className="px-6 py-2 bg-slate-800 text-white font-medium text-sm rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm w-fit"
              >
                <Icons.Plus /> Adicionar Equipamento
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Tarefas */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">3. Tarefas da OS</h3>

          <div className="space-y-4 mb-4">
            {tarefas.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm text-center">
                Nenhuma tarefa adicionada.
              </div>
            ) : (
              tarefas.map((tarefa, index) => (
                <div key={tarefa.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                        <span className="text-sm font-medium text-slate-800">
                          <span className="text-xs text-slate-400 mr-2 font-mono border border-slate-200 px-1 rounded">{tarefa.id}</span>
                          {tarefa.descricao}
                        </span>
                        {tarefa.anexo_tarefa && (
                          <div className="text-[10px] text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <Icons.FileText /> {tarefa.anexo_tarefa}
                          </div>
                        )}
                      </div>
                      {tarefa.equipamento_nome && (
                        <div className="ml-9 text-xs text-slate-500 flex items-center gap-1">
                          <Icons.Monitor /> Eq: {tarefa.equipamento_nome}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Icons.Clock /> Execução: {tarefa.data_tarefa}
                      </span>
                      <button type="button" onClick={() => handleRemoveTarefa(tarefa.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                        <Icons.Trash2 />
                      </button>
                    </div>
                  </div>

                  {tarefa.tratativa && (
                    <div className="ml-9 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-2">
                        {tarefa.tratativa_id && <span className="text-[10px] text-slate-400 font-mono border border-slate-200 px-1 rounded bg-white">{tarefa.tratativa_id}</span>}
                        Tratativa:
                      </span>
                      {tarefa.tratativa}
                      {tarefa.anexo_tratativa && (
                        <div className="mt-2 text-[10px] text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                          <Icons.FileText /> {tarefa.anexo_tratativa}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">

            {/* Primeira Linha: Info da Tarefa */}
            <div className="flex gap-3">
              <input
                value={tarefaId}
                onChange={e => setTarefaId(e.target.value)}
                type="text"
                placeholder="ID Tarefa (Ex: #001)"
                className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
              />
              <input
                value={novaTarefa}
                onChange={e => setNovaTarefa(e.target.value)}
                type="text"
                placeholder="Descreva a tarefa... (Obrigatório)"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
              />
              <select
                value={tarefaEquipamento}
                onChange={e => setTarefaEquipamento(e.target.value)}
                className="w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
              >
                <option value="">Equipamento (Opcional)</option>
                {equipamentos.map(eq => (
                  <option key={eq.id} value={eq.nome}>{eq.nome}</option>
                ))}
              </select>
              <input
                value={dataExecucao}
                onChange={e => setDataExecucao(e.target.value)}
                type="date"
                className="w-36 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
              />
              <label className="px-3 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm whitespace-nowrap">
                <Icons.Server /> {novoAnexoTarefa ? 'Anexado' : 'Doc Tarefa'}
                <input type="file" className="hidden" onChange={e => setNovoAnexoTarefa(e.target.files[0])} />
              </label>
            </div>

            {/* Segunda Linha: Info da Tratativa */}
            <div className="flex gap-3">
              <input
                value={tratativaId}
                onChange={e => setTratativaId(e.target.value)}
                type="text"
                placeholder="ID Tratativa"
                className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
              />
              <input
                value={novaTratativa}
                onChange={e => setNovaTratativa(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTarefa(e);
                  }
                }}
                type="text"
                placeholder="Tratativa da tarefa... (Opcional)"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
              />
              <label className="px-3 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm whitespace-nowrap">
                <Icons.Server /> {novoAnexoTratativa ? 'Anexado' : 'Doc Tratativa'}
                <input type="file" className="hidden" onChange={e => setNovoAnexoTratativa(e.target.files[0])} />
              </label>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleAddTarefa}
                className="px-6 py-2.5 bg-slate-800 text-white font-medium text-sm rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Icons.Plus /> Adicionar Tarefa
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-slate-600 font-medium text-sm hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
            <Icons.CheckSquare /> Criar Ordem de Serviço
          </button>
        </div>
      </form>
    </div>
  );
};
