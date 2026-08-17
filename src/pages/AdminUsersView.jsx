import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import toast from 'react-hot-toast';
import { apiFetch, API_URL } from '../config';

import { useAuth } from '../contexts/AuthContext';

export const AdminUsersView = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const isAdmin = user?.role === 'Admin';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`${API_URL}/api/auth/users`);
      if (!res.ok) throw new Error('Falha ao carregar usuários');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await apiFetch(`${API_URL}/api/auth/users/${userId}/approve`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Erro ao aprovar usuário');

      // Update state locally
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'Aprovado' } : u));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este usuário?')) return;

    try {
      setActionLoading(userId);
      const res = await apiFetch(`${API_URL}/api/auth/users/${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erro ao excluir usuário');

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-gab-gold/30 border-t-gab-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-rose-600">
        <h2 className="text-xl font-bold mb-2">Erro</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-rose-100 rounded-lg text-rose-700">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.User /> Gerenciar Acessos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aprove ou visualize os usuários cadastrados no sistema.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Papel</th>
                {isAdmin && <th className="px-6 py-4">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário cadastrado ainda.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=random`} alt="" className="w-8 h-8 rounded-full" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.status === 'Aprovado' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{u.role}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {u.status === 'Pendente' && (
                            <button
                              onClick={() => handleApprove(u.id)}
                              disabled={actionLoading === u.id}
                              className="px-3 py-1.5 bg-gab-gold hover:bg-yellow-400 text-gab-dark font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                              {actionLoading === u.id ? 'Aprovando...' : 'Aprovar Acesso'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={actionLoading === u.id}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
