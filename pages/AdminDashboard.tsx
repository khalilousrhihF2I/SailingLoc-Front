import { useEffect, useState } from 'react';
import { handleLogout } from '../utils/handleLogout';
import { Users, Ship, Calendar, DollarSign, AlertCircle, Settings, LogOut, X, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import AdminUsersPage from './AdminUsersPage';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { adminService } from '../services/ServiceFactory';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (page: import('../types/navigation').Page, data?: any) => void;
}

export function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'boats' | 'bookings' | 'payments' | 'admins'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boatSearch, setBoatSearch] = useState('');
  const [visibleBoats, setVisibleBoats] = useState(5);
  const [showOnlyUnverified, setShowOnlyUnverified] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, u, bts, bks, act] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
          adminService.getBoats(),
          adminService.getBookings(),
          adminService.getActivity()
        ]);
        if (!mounted) return;
        setStats(s);
        setUsers(u);
        setBoats(bts);
        setBookings(bks);
        setActivity(act || []);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // boats search + pagination
  const filteredBoatsAll = boats.filter(b => {
    if (showOnlyUnverified && b.isVerified) return false;
    if (!boatSearch) return true;
    const s = boatSearch.toLowerCase();
    return String(b.name).toLowerCase().includes(s) || String(b.ownerName).toLowerCase().includes(s) || String(b.type).toLowerCase().includes(s);
  });
  const filteredBoatsVisible = filteredBoatsAll.slice(0, visibleBoats);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-2">Administration SailingLoc</h2>
            <p className="text-gray-600">Panneau de gestion de la plateforme</p>
          </div>
          <Button
            variant="danger"
            onClick={() => handleLogout(onLogout)}
          >
            <LogOut size={20} />
            Déconnexion
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <DollarSign size={20} />
                  <span>Vue d'ensemble</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Users size={20} />
                  <span>Utilisateurs</span>
                </button>
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'admins'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Users size={20} />
                  <span>Administrateurs</span>
                </button>
                <button
                  onClick={() => setActiveTab('boats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'boats'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Ship size={20} />
                  <span>Annonces</span>
                  <Badge variant="warning" size="sm">3</Badge>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'bookings'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Calendar size={20} />
                  <span>Réservations</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'payments'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <DollarSign size={20} />
                  <span>Paiements</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={20} />
                  <span>Paramètres</span>
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                {loading && (
                  <Card className="p-6">Chargement...</Card>
                )}
                {error && (
                  <Card className="p-6 bg-red-50 border-red-200"><div className="text-red-800">Erreur: {error}</div></Card>
                )}
                {!loading && !error && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-ocean-100 rounded-lg flex items-center justify-center">
                          <Users className="text-ocean-600" size={24} />
                        </div>
                        <div>
                          <div className="text-2xl text-gray-900">{stats?.totalUsers ?? 0}</div>
                          <div className="text-sm text-gray-600">Utilisateurs</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-turquoise-100 rounded-lg flex items-center justify-center">
                          <Ship className="text-turquoise-600" size={24} />
                        </div>
                        <div>
                          <div className="text-2xl text-gray-900">{stats?.totalBoats ?? 0}</div>
                          <div className="text-sm text-gray-600">Bateaux</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="text-green-600" size={24} />
                        </div>
                        <div>
                          <div className="text-2xl text-gray-900">{stats?.totalBookings ?? 0}</div>
                          <div className="text-sm text-gray-600">Réservations</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="text-orange-600" size={24} />
                        </div>
                        <div>
                          <div className="text-2xl text-gray-900">{stats?.totalRevenue ?? 0}€</div>
                          <div className="text-sm text-gray-600">Revenus</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Alerts */}
                <Card className="p-6 bg-orange-50 border-orange-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-orange-600 shrink-0" size={24} />
                    <div>
                      <h4 className="text-orange-900 mb-2">Actions requises</h4>
                      <ul className="space-y-1 text-sm text-orange-800">
                        <li>• {stats?.pendingVerifications ?? 0} annonces en attente de vérification</li>
                        <li>• {stats?.pendingDocuments ?? 0} documents utilisateurs à vérifier</li>
                        <li>• {stats?.disputes ?? 0} litiges en cours</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-6">Activité récente</h3>
                  <div className="space-y-4">
                    {activity.length === 0 && (
                      <div className="text-sm text-gray-500">Aucune activité récente</div>
                    )}
                    {activity.map((a, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                        <div className="text-gray-700">{a.message || a.text || a.type}</div>
                        <div className="text-sm text-gray-500">{a.date || a.time || ''}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900">Gestion des utilisateurs</h3>
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search size={20} />}

                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm text-gray-600">Utilisateur</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-600">Type</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-600">Statut</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-ocean-600 rounded-full flex items-center justify-center text-white text-sm">
                                  {user.avatar || (user.name ? user.name.split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase() : 'U')}
                                </div>
                                <div>
                                  <div className="text-gray-900">{user.name}</div> 
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={user.type === 'owner' ? 'info' : 'default'}>
                                {user.type === 'owner' ? 'Propriétaire' : 'Locataire'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {user.email}
                               <div className="text-sm text-gray-600">ID: {user.id}</div>
                               </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={user.verified ? 'success' : 'warning'}>
                                {user.verified ? 'Vérifié' : 'Non vérifié'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  // SPA navigation to admin-user page
                                  try {
                                    onNavigate('admin-user', { userId: user.id });
                                  } catch {
                                    // fallback to URL navigation
                                    window.location.href = `/admin-user?userId=${encodeURIComponent(String(user.id))}`;
                                  }
                                }}>Gérer</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="space-y-6">
                <AdminUsersPage onNavigate={onNavigate} />
              </div>
            )}

            {activeTab === 'boats' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-6">Gestion des annonces</h3>

                  <div className="flex items-center justify-between mb-4">
                    <Input
                      type="text"
                      placeholder="Rechercher un bateau..."
                      value={boatSearch}
                      onChange={(e) => setBoatSearch(e.target.value)}
                      icon={<Search size={18} />}
                    />

                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={showOnlyUnverified} onChange={(e) => setShowOnlyUnverified(e.target.checked)} />
                      <span>Afficher seulement non vérifiées</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    {filteredBoatsVisible.map((boat) => {
                      const typeImageMap: Record<string, string> = {
                        catamaran: '/images/catamaran.png',
                        sailboat: '/images/voiliers.png',
                        semirigid: '/images/semi-rigide.jpg',
                        motor: '/images/moteur.jpg'
                      };
                      const fallback = typeImageMap[boat.type] || '/images/voiliers.png';
                      const imgSrc = boat.image || fallback;
                      return (
                        <div key={boat.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                            <img src={imgSrc} alt={boat.name} className="w-full h-full object-cover" />
                            <div className="absolute top-1 left-1 bg-white/80 text-xs text-gray-800 px-2 py-0.5 rounded">
                              {boat.type}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-gray-900 mb-1">{boat.name}</div>
                            <div className="text-sm text-gray-600">{boat.location}</div>
                            <div className="text-sm text-gray-600">Propriétaire: {boat.ownerName}</div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={boat.isVerified ? 'success' : 'default'}>{boat.isVerified ? 'Actif' : 'A modérer'}</Badge>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => onNavigate('edit-listing', { boatId: boat.id, startStep: 6 })}>
                                Modérer
                              </Button>
                              <Button variant="ghost" size="sm">
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredBoatsAll.length > visibleBoats && (
                      <div className="flex justify-center">
                        <Button variant="ghost" onClick={() => setVisibleBoats(v => v + 5)}>Afficher plus</Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'bookings' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Toutes les réservations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Référence</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Bateau</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Locataire</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Dates</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Montant</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">{booking.id}</td>
                          <td className="py-3 px-4 text-gray-700">{booking.boatName}</td>
                          <td className="py-3 px-4 text-gray-700">{booking.renterName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {booking.startDate} → {booking.endDate}
                          </td>
                          <td className="py-3 px-4 text-gray-900">{booking.totalPrice}€</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                booking.status === 'confirmed'
                                  ? 'success'
                                  : booking.status === 'pending'
                                    ? 'warning'
                                    : 'default'
                              }
                              size="sm"
                            >
                              {booking.status === 'confirmed' && 'Confirmée'}
                              {booking.status === 'cancelled' && 'Annulée'}
                              {booking.status === 'pending' && 'En attente'}
                              {booking.status === 'completed' && 'Terminée'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'payments' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Gestion des paiements</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-800 mb-1">Payés</div>
                      <div className="text-2xl text-green-900">28,765€</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-800 mb-1">En attente</div>
                      <div className="text-2xl text-orange-900">4,900€</div>
                    </div>
                    <div className="p-4 bg-ocean-50 rounded-lg border border-ocean-200">
                      <div className="text-sm text-ocean-800 mb-1">Frais SailingLoc (10%)</div>
                      <div className="text-2xl text-ocean-900">{stats?.totalRevenue ?? 0}€</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
        {/* Navigation to dedicated AdminUserPage handles user management */}
      </div>
    </div>
  );
}
