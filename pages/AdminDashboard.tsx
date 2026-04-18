import { useEffect, useState } from 'react';
import { handleLogout } from '../utils/handleLogout';
import { Users, Ship, Calendar, DollarSign, AlertCircle, LogOut, X, Search, LayoutDashboard, ShieldCheck, MessageSquare, Star, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { DashboardShell, StatCard, SectionTitle } from '../components/ui/DashboardShell';
import AdminUsersPage from './AdminUsersPage';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { TablePagination } from '../components/ui/TablePagination';
import { adminService } from '../services/ServiceFactory';
import { apiClient } from '../lib/apiClient';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (page: import('../types/navigation').Page, data?: any) => void;
}

export function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'boats' | 'bookings' | 'payments' | 'admins' | 'reviews' | 'disputes'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boatSearch, setBoatSearch] = useState('');
  const [showOnlyUnverified, setShowOnlyUnverified] = useState(false);

  // Review moderation & disputes
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputeFilter, setDisputeFilter] = useState<string>('all');
  const [reviewsPage, setReviewsPage] = useState(1);
  const [disputesPage, setDisputesPage] = useState(1);

  // Pagination state per tab
  const [usersPage, setUsersPage] = useState(1);
  const [boatsPage, setBoatsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const PAGE_SIZE = 10;

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

        // Load pending reviews & disputes (non-blocking)
        const [revRes, dispRes] = await Promise.all([
          apiClient.get<any[]>('/review/moderation/pending').catch(() => ({ data: [] })),
          apiClient.get<any[]>('/dispute').catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setPendingReviews(revRes.data || []);
        setDisputes(dispRes.data || []);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filteredBoatsAll = boats.filter(b => {
    if (showOnlyUnverified && b.isVerified) return false;
    if (!boatSearch) return true;
    const s = boatSearch.toLowerCase();
    return String(b.name).toLowerCase().includes(s) || String(b.ownerName).toLowerCase().includes(s) || String(b.type).toLowerCase().includes(s);
  });
  const boatsTotalPages = Math.ceil(filteredBoatsAll.length / PAGE_SIZE);
  const filteredBoatsVisible = filteredBoatsAll.slice((boatsPage - 1) * PAGE_SIZE, boatsPage * PAGE_SIZE);

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users size={20} /> },
    { id: 'admins', label: 'Administrateurs', icon: <ShieldCheck size={20} /> },
    { id: 'boats', label: 'Annonces', icon: <Ship size={20} />, badge: stats?.pendingVerifications || undefined, badgeVariant: 'warning' as const },
    { id: 'bookings', label: 'Réservations', icon: <Calendar size={20} /> },
    { id: 'payments', label: 'Paiements', icon: <DollarSign size={20} /> },
    { id: 'reviews', label: 'Modération', icon: <Star size={20} />, badge: pendingReviews.length || undefined, badgeVariant: 'warning' as const },
    { id: 'disputes', label: 'Litiges', icon: <MessageSquare size={20} />, badge: disputes.filter(d => d.status === 'open' || d.status === 'under_review').length || undefined, badgeVariant: 'danger' as const },
  ];

  const handleTabChange = (tabId: string) => {
    if (tabId === 'logout') {
      handleLogout(onLogout);
      return;
    }
    setActiveTab(tabId as any);
  };

  const translateStatus = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return 'Confirmée';
    if (s === 'cancelled') return 'Annulée';
    if (s === 'pending') return 'En attente';
    if (s === 'completed') return 'Terminée';
    return status || 'Inconnu';
  };

  const statusVariant = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return 'success' as const;
    if (s === 'pending') return 'warning' as const;
    if (s === 'cancelled') return 'danger' as const;
    return 'default' as const;
  };

  return (
    <DashboardShell
      title="Administration SailingLoc"
      subtitle="Panneau de gestion de la plateforme"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      headerActions={
        <Button variant="danger" onClick={() => handleLogout(onLogout)}>
          <LogOut size={18} />
          Déconnexion
        </Button>
      }
    >
      {/* Loading / Error states */}
      {loading && <Card className="p-8 text-center text-gray-500">Chargement des données...</Card>}
      {error && <Alert type="error">Erreur : {error}</Alert>}

      {/* Overview Tab */}
      {activeTab === 'overview' && !loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Utilisateurs" value={stats?.totalUsers ?? 0} icon={<Users className="text-ocean-600" size={22} />} iconBg="bg-ocean-100" />
            <StatCard label="Bateaux" value={stats?.totalBoats ?? 0} icon={<Ship className="text-turquoise-600" size={22} />} iconBg="bg-turquoise-100" />
            <StatCard label="Réservations" value={stats?.totalBookings ?? 0} icon={<Calendar className="text-green-600" size={22} />} iconBg="bg-green-100" />
            <StatCard label="Revenus" value={`${stats?.totalRevenue ?? 0}€`} icon={<DollarSign className="text-orange-600" size={22} />} iconBg="bg-orange-100" />
          </div>

          {/* Action alerts */}
          <Card className="p-6 border-orange-200 bg-orange-50/60">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
              <div>
                <h4 className="text-orange-900 font-semibold mb-2">Actions requises</h4>
                <ul className="space-y-1.5 text-sm text-orange-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    {stats?.pendingVerifications ?? 0} annonces en attente de vérification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    {stats?.pendingDocuments ?? 0} documents utilisateurs à vérifier
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    {stats?.disputes ?? 0} litiges en cours
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <SectionTitle title="Activité récente" />
            <div className="space-y-3">
              {activity.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">Aucune activité récente</div>
              )}
              {activity.map((a, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="text-sm text-gray-700">{a.message || a.text || a.type}</div>
                  <div className="text-xs text-gray-400">{a.date || a.time || ''}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="p-6">
          <SectionTitle
            title="Gestion des utilisateurs"
            action={
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={18} />}
                />
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = users.filter(u => !searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
                  const paginated = filtered.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE);
                  return paginated.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {user.avatar || (user.name ? user.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase() : 'U')}
                        </div>
                        <span className="text-gray-900 font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.type === 'owner' ? 'info' : 'default'}>
                        {user.type === 'owner' ? 'Propriétaire' : 'Locataire'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700 text-sm">{user.email}</div>
                      <div className="text-xs text-gray-400">ID: {user.id}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={user.verified ? 'success' : 'warning'}>
                        {user.verified ? 'Vérifié' : 'Non vérifié'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => {
                        try { onNavigate('admin-user', { userId: user.id }); }
                        catch { window.location.href = `/admin-user?userId=${encodeURIComponent(String(user.id))}`; }
                      }}>
                        Gérer
                      </Button>
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
            {(() => {
              const filtered = users.filter(u => !searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
              return (
                <TablePagination
                  currentPage={usersPage}
                  totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
                  onPageChange={setUsersPage}
                  totalItems={filtered.length}
                />
              );
            })()}
          </div>
        </Card>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <AdminUsersPage onNavigate={onNavigate} />
      )}

      {/* Boats Tab */}
      {activeTab === 'boats' && (
        <Card className="p-6">
          <SectionTitle title="Gestion des annonces" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Rechercher un bateau..."
                value={boatSearch}
                onChange={(e) => setBoatSearch(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showOnlyUnverified} onChange={(e) => setShowOnlyUnverified(e.target.checked)} className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500" />
              Non vérifiées uniquement
            </label>
          </div>

          <div className="space-y-3">
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
                <div key={boat.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
                    <img src={imgSrc} alt={boat.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-white/90 text-xs text-gray-700 px-2 py-0.5 rounded-md font-medium">
                      {boat.type}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-medium truncate">{boat.name}</div>
                    <div className="text-sm text-gray-500">{boat.location}</div>
                    <div className="text-sm text-gray-500">Propriétaire : {boat.ownerName}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={boat.isVerified ? 'success' : 'warning'}>
                      {boat.isVerified ? 'Actif' : 'À modérer'}
                    </Badge>
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

            {filteredBoatsVisible.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">Aucune annonce trouvée</div>
            )}
            <TablePagination
              currentPage={boatsPage}
              totalPages={boatsTotalPages}
              onPageChange={setBoatsPage}
              totalItems={filteredBoatsAll.length}
            />
          </div>
        </Card>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <Card className="p-6">
          <SectionTitle title="Toutes les réservations" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bateau</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Locataire</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice((bookingsPage - 1) * PAGE_SIZE, bookingsPage * PAGE_SIZE).map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{booking.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{booking.boatName}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{booking.renterName}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{booking.startDate} → {booking.endDate}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{booking.totalPrice}€</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(booking.status)} size="sm">
                        {translateStatus(booking.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">Aucune réservation</div>
            )}
            <TablePagination
              currentPage={bookingsPage}
              totalPages={Math.ceil(bookings.length / PAGE_SIZE)}
              onPageChange={setBookingsPage}
              totalItems={bookings.length}
            />
          </div>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Stats */}
          {(() => {
            const paidBookings = bookings.filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'completed');
            const pendingBookings = bookings.filter(b => b.status?.toLowerCase() === 'pending');
            const totalPaid = paidBookings.reduce((sum: number, b: any) => sum + (Number(b.totalPrice) || 0), 0);
            const totalPending = pendingBookings.reduce((sum: number, b: any) => sum + (Number(b.totalPrice) || 0), 0);
            const commission = Math.round(totalPaid * 0.1);
            const allPaymentBookings = [...bookings].sort((a: any, b: any) => {
              const da = a.startDate ? new Date(a.startDate).getTime() : 0;
              const db = b.startDate ? new Date(b.startDate).getTime() : 0;
              return db - da;
            });
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-5 border-green-100 bg-green-50/30">
                    <div className="text-sm text-green-700 mb-1">Total encaissé</div>
                    <div className="text-2xl font-semibold text-green-900">{totalPaid.toLocaleString('fr-FR')}€</div>
                    <div className="text-xs text-green-600 mt-1">{paidBookings.length} réservations</div>
                  </Card>
                  <Card className="p-5 border-orange-100 bg-orange-50/30">
                    <div className="text-sm text-orange-700 mb-1">En attente</div>
                    <div className="text-2xl font-semibold text-orange-900">{totalPending.toLocaleString('fr-FR')}€</div>
                    <div className="text-xs text-orange-600 mt-1">{pendingBookings.length} réservations</div>
                  </Card>
                  <Card className="p-5 border-ocean-100 bg-ocean-50/30">
                    <div className="text-sm text-ocean-700 mb-1">Commission SailingLoc (10%)</div>
                    <div className="text-2xl font-semibold text-ocean-900">{commission.toLocaleString('fr-FR')}€</div>
                  </Card>
                  <Card className="p-5 border-gray-100 bg-gray-50/30">
                    <div className="text-sm text-gray-700 mb-1">Reversé aux propriétaires</div>
                    <div className="text-2xl font-semibold text-gray-900">{(totalPaid - commission).toLocaleString('fr-FR')}€</div>
                  </Card>
                </div>

                {/* Payments Table */}
                <Card className="p-6">
                  <SectionTitle title="Historique des paiements" />
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Réf.</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bateau</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Locataire</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPaymentBookings.slice((paymentsPage - 1) * PAGE_SIZE, paymentsPage * PAGE_SIZE).map((booking: any) => {
                          const amount = Number(booking.totalPrice) || 0;
                          const comm = Math.round(amount * 0.1);
                          const payStatus = booking.status?.toLowerCase() === 'confirmed' || booking.status?.toLowerCase() === 'completed' ? 'Payé' : booking.status?.toLowerCase() === 'pending' ? 'En attente' : 'Annulé';
                          const payVariant = payStatus === 'Payé' ? 'success' as const : payStatus === 'En attente' ? 'warning' as const : 'danger' as const;
                          return (
                            <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4 text-sm text-gray-600 font-mono">{booking.id}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{booking.boatName}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{booking.renterName}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{booking.startDate} → {booking.endDate}</td>
                              <td className="py-3 px-4 text-sm font-semibold text-gray-900">{amount}€</td>
                              <td className="py-3 px-4 text-sm text-ocean-700">{comm}€</td>
                              <td className="py-3 px-4">
                                <Badge variant={payVariant} size="sm">{payStatus}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {allPaymentBookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">Aucun paiement</div>
                    )}
                    <TablePagination
                      currentPage={paymentsPage}
                      totalPages={Math.ceil(allPaymentBookings.length / PAGE_SIZE)}
                      onPageChange={setPaymentsPage}
                      totalItems={allPaymentBookings.length}
                    />
                  </div>
                </Card>
              </>
            );
          })()}
        </div>
      )}

      {/* Reviews Moderation Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <SectionTitle title={`Avis en attente de modération (${pendingReviews.length})`} />
          {pendingReviews.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
              <p>Aucun avis en attente de modération</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingReviews.slice((reviewsPage - 1) * PAGE_SIZE, reviewsPage * PAGE_SIZE).map((review: any) => (
                <Card key={review.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{review.userName || review.userId}</span>
                        <span className="text-yellow-500">{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</span>
                        <Badge variant="warning" size="sm">En attente</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Bateau : {review.boatName || review.boatId} — {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR') : ''}</p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={async () => {
                          await apiClient.patch(`/review/${review.id}/approve`, {});
                          setPendingReviews(prev => prev.filter(r => r.id !== review.id));
                        }}
                      >
                        <CheckCircle size={16} className="mr-1" /> Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const reason = prompt('Motif du rejet :');
                          if (!reason) return;
                          await apiClient.patch(`/review/${review.id}/reject`, { reason });
                          setPendingReviews(prev => prev.filter(r => r.id !== review.id));
                        }}
                      >
                        <XCircle size={16} className="mr-1" /> Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <TablePagination
                currentPage={reviewsPage}
                totalPages={Math.ceil(pendingReviews.length / PAGE_SIZE)}
                onPageChange={setReviewsPage}
                totalItems={pendingReviews.length}
              />
            </div>
          )}
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle title={`Litiges (${disputes.length})`} />
            <div className="flex gap-2">
              {['all', 'open', 'under_review', 'resolved', 'closed'].map(f => (
                <button
                  key={f}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${disputeFilter === f ? 'bg-ocean-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => { setDisputeFilter(f); setDisputesPage(1); }}
                >
                  {f === 'all' ? 'Tous' : f === 'open' ? 'Ouvert' : f === 'under_review' ? 'En examen' : f === 'resolved' ? 'Résolu' : 'Fermé'}
                </button>
              ))}
            </div>
          </div>
          {(() => {
            const filtered = disputeFilter === 'all' ? disputes : disputes.filter(d => d.status === disputeFilter);
            const paged = filtered.slice((disputesPage - 1) * PAGE_SIZE, disputesPage * PAGE_SIZE);
            if (filtered.length === 0) return (
              <Card className="p-8 text-center text-gray-500">
                <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                <p>Aucun litige{disputeFilter !== 'all' ? ` avec le statut "${disputeFilter}"` : ''}</p>
              </Card>
            );
            return (
              <div className="space-y-4">
                {paged.map((dispute: any) => {
                  const statusColor = dispute.status === 'open' ? 'warning' : dispute.status === 'under_review' ? 'info' : dispute.status === 'resolved' ? 'success' : 'default';
                  const statusLabel = dispute.status === 'open' ? 'Ouvert' : dispute.status === 'under_review' ? 'En examen' : dispute.status === 'resolved' ? 'Résolu' : 'Fermé';
                  return (
                    <Card key={dispute.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{dispute.subject}</span>
                            <Badge variant={statusColor as any} size="sm">{statusLabel}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Réservation #{dispute.bookingId} — Signalé par {dispute.reporterName || dispute.reporterId} — {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString('fr-FR') : ''}
                          </p>
                          <p className="text-gray-700 mb-2">{dispute.description}</p>
                          {dispute.resolution && (
                            <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                              <strong>Résolution :</strong> {dispute.resolution}
                            </div>
                          )}
                          {dispute.adminNote && (
                            <p className="text-sm text-gray-500 mt-1 italic">Note admin : {dispute.adminNote}</p>
                          )}
                        </div>
                        {(dispute.status === 'open' || dispute.status === 'under_review') && (
                          <div className="shrink-0">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={async () => {
                                const resolution = prompt('Résolution du litige :');
                                if (!resolution) return;
                                const adminNote = prompt('Note admin (facultatif) :') || '';
                                await apiClient.patch(`/dispute/${dispute.id}/resolve`, { resolution, adminNote });
                                setDisputes(prev => prev.map(d => d.id === dispute.id ? { ...d, status: 'resolved', resolution, adminNote } : d));
                              }}
                            >
                              Résoudre
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
                <TablePagination
                  currentPage={disputesPage}
                  totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
                  onPageChange={setDisputesPage}
                  totalItems={filtered.length}
                />
              </div>
            );
          })()}
        </div>
      )}
    </DashboardShell>
  );
}
