import React from 'react';
import { useState, useEffect } from 'react';
import { adminUsersService } from '../services/ServiceFactory';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useModal } from '../hooks/useModal';
import { Page } from '../types/navigation';

const PAGE_SIZE = 10;

const AdminUsersPage: React.FC<{ onNavigate?: (p: Page, d?: any) => void }> = ({ }) => {
    // const AdminUsersPage: React.FC<{ onNavigate?: (p: Page, d?: any) => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

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
    adminUsersService.getAuditLogs(1, 10).then((res) => setAuditLogs(res?.items || []));
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
      loadUsers(1);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    modal.showConfirm({
      title: 'Delete user',
      message: 'Are you sure you want to delete this user? This cannot be undone.',
      onConfirm: async () => {
        await adminUsersService.deleteUser(id);
        loadUsers(page);
      }
    });
  };

//   const handleAssignRoles = (id: string) => {
//     modal.showConfirm({
//       title: 'Assign Admin role',
//       message: 'Assign the Admin role to this user?',
//       onConfirm: async () => {
//         await adminUsersService.assignRoles(id, { roles: ['Admin'] });
//         loadUsers(page);
//       }
//     });
//   };

  const adminUsers = users.filter((u) => {
    const ut = (u.userType || u.type || '') as string;
    if (ut && String(ut).toLowerCase() === 'admin') return true;
    const roles = u.roles || [];
    return roles.some((r: string) => String(r).toLowerCase() === 'admin');
  });

  return (
    <div>
      <Card className="p-5">
        <h3 className="text-lg font-semibold">Ajouter un administrateur</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={handleCreate} disabled={creating}>Create Admin</Button>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h3 className="text-md font-medium">Les administrateurs</h3>
        <div className="mt-4">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="w-1/4">Email</th>
                <th className="w-1/6">Name</th>
                <th className="w-1/6">Roles</th>
                <th className="w-1/4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-4">Loading...</td>
                </tr>
              )}

              {!loading && adminUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">No administrators found.</td>
                </tr>
              )}

              {!loading && adminUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">{u.firstName} {u.lastName}</td>
                  <td className="py-3 px-4">{(u.roles || []).join(', ') || (u.userType || 'Inconnu')}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {/* <Button size="sm" onClick={() => onNavigate?.('admin-user', { userId: u.id })}>Open</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAssignRoles(u.id)}>Roles</Button> */}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4">
            <div>Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button onClick={() => loadUsers(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
              <Button onClick={() => loadUsers(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h3 className="text-md font-medium">Historique des actions</h3>
        <ul className="mt-2 space-y-2">
          {auditLogs.map((a) => (
            <li key={a.id} className="text-sm text-muted-foreground">{a.message}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
