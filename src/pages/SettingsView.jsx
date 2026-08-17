import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { apiFetch, API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const SettingsView = () => {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    if (window.confirm('Tem certeza que deseja limpar o cache local? Todos os filtros não salvos serão resetados.')) {
      setClearing(true);
      setTimeout(() => {
        sessionStorage.clear();
        setClearing(false);
        setCleared(true);
        setTimeout(() => setCleared(false), 3000);
      }, 800); // Simulate processing time for UX
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nome: user?.nome || '', email: user?.email || '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveError('');
      const response = await apiFetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (sessionStorage.getItem('token')) {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        updateUser(data.user);
        setIsEditing(false);
      } else {
        setSaveError(data.error || 'Erro ao salvar perfil.');
      }
    } catch (err) {
      setSaveError('Erro de conexão com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icons.Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Configurações do Sistema
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Gerencie suas preferências de uso, aparência e dados armazenados localmente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-500">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Icons.User className="w-4 h-4" />
                Seu Perfil
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditForm({ nome: user?.nome || '', email: user?.email || '' });
                    setIsEditing(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Icons.Edit className="w-3 h-3" />
                  Editar
                </button>
              )}
            </div>

            <div className="flex items-start gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'User')}&background=random&size=128`}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={editForm.nome}
                        onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    {saveError && <p className="text-xs text-rose-500 font-semibold">{saveError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving || !editForm.nome || !editForm.email}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setSaveError(''); }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{user?.nome || 'Usuário Desconhecido'}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{user?.email || 'email@exemplo.com'}</p>
                    <div className="inline-flex mt-3 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-bold tracking-wide">
                      {user?.role === 'Admin' ? 'ADMINISTRADOR' : 'USUÁRIO PADRÃO'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl transition-colors cursor-pointer border border-rose-200 dark:border-rose-500/30"
            >
              <Icons.LogOut className="w-5 h-5" />
              Encerrar Sessão
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Appearance Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-500">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Icons.Monitor className="w-4 h-4" />
              Aparência
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Modo Escuro (Dark Mode)</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Alternar o tema visual de toda a aplicação.</p>
              </div>

              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}
                role="switch"
                aria-checked={isDark}
              >
                <span className="sr-only">Habilitar modo escuro</span>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform flex items-center justify-center ${isDark ? 'translate-x-7' : 'translate-x-1'}`}>
                  {isDark ? <Icons.Moon className="w-3 h-3 text-blue-600" /> : <Icons.Sun className="w-3 h-3 text-amber-500" />}
                </span>
              </button>
            </div>
          </div>

          {/* System & Storage Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-500">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Icons.Server className="w-4 h-4" />
              Sistema e Armazenamento
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Limpar Cache Local</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Apaga todos os dados temporários do seu navegador (como filtros que ficaram salvos entre as abas e pesquisas pendentes). Use caso sinta que a página está mostrando dados desatualizados ou "travados".
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearCache}
                  disabled={clearing}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.RefreshCw className={`w-4 h-4 ${clearing ? 'animate-spin' : ''}`} />
                  {clearing ? 'Limpando...' : 'Limpar Cache'}
                </button>

                {cleared && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1 animate-pulse">
                    <Icons.CheckCircle className="w-4 h-4" /> Cache limpo!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Sistema GAB — ASSESP v2.0 <br />
          Setor Jurídico | PPMA
        </p>
      </div>
    </div>
  );
};
