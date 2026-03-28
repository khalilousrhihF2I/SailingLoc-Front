import React, { useEffect, useState } from 'react';
import { adminUsersService } from '../services/ServiceFactory';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Save, ArrowLeft, User } from 'lucide-react';

const AdminUserDetailPage: React.FC<{ pageData?: any }> = ({ pageData }) => {
  const userId = (pageData && pageData.userId) || '';
  const [user, setUser] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    adminUsersService.getUserById(userId).then((u) => setUser(u));
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await adminUsersService.updateUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft size={18} />
          Retour
        </Button>
      </div>

      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="w-14 h-14 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xl">
            {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase() || <User size={24} />}
          </div>
          <div>
            <h2 className="text-gray-900">{user.firstName} {user.lastName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info">{user.roles?.join(', ') || user.userType || 'Utilisateur'}</Badge>
              <span className="text-sm text-gray-500">ID: {userId}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              value={user.email || ''}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              disabled
            />
            <Input
              label="Prénom"
              value={user.firstName || ''}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
            <Input
              label="Nom"
              value={user.lastName || ''}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button onClick={handleSave} disabled={saving} variant="primary">
              <Save size={18} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            {saved && <span className="text-sm text-green-600">Modifications enregistrées</span>}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminUserDetailPage;
