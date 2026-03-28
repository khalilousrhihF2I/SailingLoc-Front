import React, { useEffect, useState } from 'react';
import { adminUsersService } from '../services/ServiceFactory';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Save, ArrowLeft, User, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-500">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft size={18} />
          Retour
        </Button>

        <Card className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="w-14 h-14 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
              {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase() || <User size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="info">{user.roles?.join(', ') || user.userType || 'Utilisateur'}</Badge>
                <span className="text-xs text-gray-400">ID: {userId}</span>
              </div>
            </div>
          </div>

          {/* Success feedback */}
          {saved && <Alert type="success"><CheckCircle size={16} className="inline mr-1" />Profil enregistré avec succès</Alert>}

          {/* Form */}
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
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
