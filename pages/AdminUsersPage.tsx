import React from 'react';
import { useState, useEffect } from 'react';
import { adminUsersService } from '../services/ServiceFactory';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useModal } from '../hooks/useModal';
import { Page } from '../types/navigation';
import { UserPlus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const PAGE_SIZE = 10;

const AdminUsersPage: React.FC<{ onNavigate?: (p: Page, d?: any) => void }> = ({}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const modal = useModal();

  const loadUsers = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminUsersService.getUsers(p, PAGE_SIZE);
      setUsers(res?.items || []);
      const total = (res?.total ?? 0) || 0;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const dto = {
        email,
        password,
        firstName,
        lastName,
        phoneNumber: '+3300000000',
        address: { street: '', city: '', state: '', postalCode: '', country: '' },
        role: 'Admin',
      } as any;
      await adminUsersService.createUser(dto);
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setShowCreateModal(false);
      loadUsers(1);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    modal.showConfirm({
      title: 'Supprimer l\'administrateur',
      message: 'Etes-vous sur de vouloir supprimer cet administrateur ? Cette action est irreversible.',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      onConfirm: async () => {
        await adminUsersService.deleteUser(id);
        loadUsers(page);
      }
    });
  };

  const adminUsers = users.filter((u) => {
    const ut = (u.userType || u.type || '') as string;
    if (ut && String(ut).toLowerCase() === 'admin') return true;
    const roles = u.roles || [];
    return roles.some((r: string) => String(r).toLowerCase() === 'admin');
  });

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Administrateurs</h2>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={18} />
          Ajouter un administrateur
        </Button>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="text-ocean-600" size={20} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold">Ajouter un administrateur</h3>
                  <p className="text-sm text-gray-500">Creer un nouveau compte administrateur</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" placeholder="admin@sailingloc.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              <Input label="Prenom" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Nom" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input label="Mot de passe" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Annuler</Button>
              <Button onClick={handleCreate} disabled={creating || !email || !password || !firstName || !lastName} variant="primary">
                <UserPlus size={18} />
                {creating ? 'Creation...' : 'Creer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Users Table */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-6">Liste des administrateurs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-[11px] uppercase tracking-wider text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-[11px] uppercase tracking-wider text-gray-500">Nom</th>
                <th className="text-left py-3 px-4 text-[11px] uppercase tracking-wider text-gray-500">Roles</th>
                <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Chargement...</td>
                </tr>
              )}

              {!loading && adminUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Aucun administrateur trouve</td>
                </tr>
              )}

              {!loading && adminUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xs">
                        {(u.firstName?.[0] || '').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}
                      </div>
                      <span className="text-gray-700">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{u.firstName} {u.lastName}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{(u.roles || []).join(', ') || (u.userType || 'Admin')}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>
                      <Trash2 size={14} />
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">Page {page} sur {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => loadUsers(Math.max(1, page - 1))} disabled={page <= 1}>
              <ChevronLeft size={16} />
              Precedent
            </Button>
            <Button variant="ghost" size="sm" onClick={() => loadUsers(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              Suivant
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
