
import React, { useState, useEffect, useMemo } from 'react';
import { AccessUser, UserFormData, CardStatus, CardIssue } from './types';
import { storageService } from './services/storage';
import { CardForm } from './components/CardForm';
import { Badge } from './components/Badge';
import { UserDetailModal } from './components/UserDetailModal';
import { STATUS_COLORS, LINK_TYPE_COLORS, THEME_KEY } from './constants';

const App: React.FC = () => {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<AccessUser | null>(null);
  const [editingUser, setEditingUser] = useState<AccessUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | CardStatus>('all');
  const [showOnlySecondIssue, setShowOnlySecondIssue] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved as 'light' | 'dark') || 'light';
  });

  // Sync Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Load Data from IndexedDB
  useEffect(() => {
    const load = async () => {
      try {
        await storageService.init();
        const loaded = await storageService.getUsers();
        setUsers(loaded);
      } catch (e) {
        console.error('Falha ao carregar banco de dados:', e);
      }
    };
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.cpf.includes(searchQuery);
      
      const matchesTab = activeTab === 'all' || user.status === activeTab;
      const matchesSecondIssue = !showOnlySecondIssue || user.cardIssue === CardIssue.SECOND;
      
      return matchesSearch && matchesTab && matchesSecondIssue;
    });
  }, [users, searchQuery, activeTab, showOnlySecondIssue]);

  const handleAddOrEdit = async (data: UserFormData) => {
    const userToSave: AccessUser = editingUser 
      ? { ...editingUser, ...data, updatedAt: new Date().toISOString() }
      : { ...data, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };

    try {
      await storageService.saveUser(userToSave);
      const updatedList = await storageService.getUsers();
      setUsers(updatedList);
      closeForm();
      setViewingUser(null);
    } catch (e) {
      alert('Erro ao salvar no banco de dados.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Excluir este registro permanentemente?')) {
      try {
        await storageService.deleteUser(id);
        const updatedList = await storageService.getUsers();
        setUsers(updatedList);
        if (viewingUser?.id === id) setViewingUser(null);
      } catch (e) {
        alert('Erro ao excluir.');
      }
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const triggerEdit = (e: React.MouseEvent, user: AccessUser) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsFormOpen(true);
    setViewingUser(null);
  };

  const triggerView = (user: AccessUser) => {
    setViewingUser(user);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await storageService.importData(file);
        for (const user of imported) {
          await storageService.saveUser(user);
        }
        const updatedList = await storageService.getUsers();
        setUsers(updatedList);
        alert('Dados importados com sucesso!');
      } catch (err) {
        alert('Erro na importação.');
      }
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.355r-.463-.232A11.955 11.955 0 013.382 18.24m17.236 0a11.955 11.955 0 01-8.618 3.115" /></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">Acesso CIT Pro</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              {theme === 'light' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"></path></svg>}
            </button>
            <button onClick={() => storageService.exportData(users)} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">Exportar</button>
            <label className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
              Importar <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">+ Novo Registro</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Total Registrado</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
            <p className="text-green-600 dark:text-green-400 text-sm font-medium">Cartões Ativos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.status === CardStatus.ACTIVE).length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
            <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">2ª Via Pedidas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.cardIssue === CardIssue.SECOND).length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Armazenamento</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">LocalDB</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex p-1 bg-gray-200 dark:bg-slate-700 rounded-xl overflow-x-auto whitespace-nowrap">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-400'}`}>Todos</button>
              {Object.values(CardStatus).map(status => (
                <button key={status} onClick={() => setActiveTab(status)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === status ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-400'}`}>{status}</button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowOnlySecondIssue(!showOnlySecondIssue)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${showOnlySecondIssue ? 'bg-orange-500 border-orange-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              Filtro 2ª Via {showOnlySecondIssue ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="relative w-full md:w-96">
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Pesquisar por Nome ou CPF..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">CIT / Cartão</th>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4">Via</th>
                  <th className="px-6 py-4">Anexo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => triggerView(user)}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.fullName}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{user.cpf}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col font-mono text-xs text-gray-600 dark:text-slate-400">
                        <span>CIT: {user.citSmartNr}</span>
                        <span>Card: {user.accessCardNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">{user.department}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${user.cardIssue === CardIssue.SECOND ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'text-slate-600 dark:text-slate-400'}`}>
                        {user.cardIssue}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.attachment ? (
                        <div className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          Arquivo
                        </div>
                      ) : <span className="text-xs text-gray-400">Nenhum</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={user.status} className={STATUS_COLORS[user.status as keyof typeof STATUS_COLORS]} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); triggerView(user); }} 
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Visualizar Detalhes"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={(e) => triggerEdit(e, user)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                        <button onClick={(e) => handleDelete(e, user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <UserDetailModal 
            user={viewingUser} 
            onClose={() => setViewingUser(null)} 
            onEdit={(user) => {
              setEditingUser(user);
              setIsFormOpen(true);
              setViewingUser(null);
            }} 
          />
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <CardForm initialData={editingUser} onSubmit={handleAddOrEdit} onCancel={closeForm} />
        </div>
      )}
    </div>
  );
};

export default App;
