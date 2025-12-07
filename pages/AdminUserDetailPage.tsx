import React, { useEffect, useState } from 'react';
import { adminUsersService } from '../services/ServiceFactory';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const AdminUserDetailPage: React.FC<{ pageData?: any }> = ({ pageData }) => {
  const userId = (pageData && pageData.userId) || '';
  const [user, setUser] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    adminUsersService.getUserById(userId).then((u) => setUser(u));
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await adminUsersService.updateUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
      });
      alert('Saved');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <Card>
      <h2 className="text-lg font-semibold">Admin User</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        <Input value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
        <Input value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
      </div>
      <div className="mt-4">
        <Button onClick={handleSave} disabled={saving}>Save</Button>
      </div>
    </Card>
  );
};

export default AdminUserDetailPage;
