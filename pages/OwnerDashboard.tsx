import  { useEffect, useState } from 'react';
import { Ship, Calendar, TrendingUp, Plus, LogOut, Edit, Eye, User, Trash2, Slash, FileText } from 'lucide-react';
import { handleLogout } from '../utils/handleLogout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ownerDashboardService, authService, userService, bookingService, boatService, userDocumentService } from '../services/ServiceFactory';
import { useModal } from '../hooks/useModal';
import { Page } from '../types/navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AvailabilityCalendar } from '../components/availability/AvailabilityCalendar';

interface OwnerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onLogout: () => void;
}

export function OwnerDashboard({ onNavigate, onLogout }: OwnerDashboardProps) {
  const { showAlert, showConfirm } = useModal();
  const [ownerDocuments, setOwnerDocuments] = useState<any[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [selectedBoatForDoc, setSelectedBoatForDoc] = useState<number | null>(null);
  const [newDocType, setNewDocType] = useState<string>('Permis bateau');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'boats' | 'bookings' | 'revenue' | 'calendar' | 'profile' | 'documents'>('overview');
  const [selectedBoatForCalendar, setSelectedBoatForCalendar] = useState<number>(1);

  const [boats, setBoats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<any>({ id: undefined, firstName: '', lastName: '', email: '', phone: '', avatar: '', memberSince: '', street: '', city: '', state: '', postalCode: '', country: '', roles: [] });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, bts, bks] = await Promise.all([
          ownerDashboardService.getStats(),
          ownerDashboardService.getBoats(),
          ownerDashboardService.getBookings()
        ]);
        if (!mounted) return;
        setStats(s);
        setBoats(bts);
        // map API DTO (PascalCase) to UI-friendly camelCase shape
        const mappedBookings = (bks || []).map((bk: any) => mapOwnerBooking(bk));
        setBookings(mappedBookings);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
      // load owner documents
      (async () => {
        try {
          const docs = await userDocumentService.getMyDocuments();
          if (mounted) setOwnerDocuments(docs || []);
        } catch {
          // ignore
        }
      })();
    // Load payments on mount so the revenue tab has data immediately
    reloadPayments();
    return () => { mounted = false; };
  }, []);

  const reloadBookings = async () => {
    setLoading(true);
    try {
      const bks = await ownerDashboardService.getBookings();
      const mappedBookings = (bks || []).map((bk: any) => mapOwnerBooking(bk));
      setBookings(mappedBookings);
      } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const reloadPayments = async () => {
    setLoading(true);
    try {
      // Resolve owner id from available sources (profileForm, profile, authService, userService)
      const resolveOwnerId = async (): Promise<number | null> => {
        // Prefer explicit profileForm id
        const raw = profileForm?.id ?? profile?.id;
        if (raw !== undefined && raw !== null && raw !== '') {
          const n = Number(raw);
          if (!Number.isNaN(n) && Number.isFinite(n)) return n;
        }

        // Try ownerDashboardService.getProfile if available
        try {
          if ((ownerDashboardService as any).getProfile) {
            const p = await (ownerDashboardService as any).getProfile();
            const id = p?.id;
            if (id !== undefined && id !== null && id !== '') {
              const n = Number(id);
              if (!Number.isNaN(n) && Number.isFinite(n)) return n;
            }
          }
        } catch {
          // ignore
        }

        // Try authService.getCurrentUser
        try {
          if ((authService as any).getCurrentUser) {
            const u = await (authService as any).getCurrentUser();
            const id = u?.id;
            if (id !== undefined && id !== null && id !== '') {
              const n = Number(id);
              if (!Number.isNaN(n) && Number.isFinite(n)) return n;
            }
          }
        } catch {
          // ignore
        }

        // Try userService.getUserByEmail as a last resort
        try {
          if ((userService as any).getUserByEmail && (authService as any).getCurrentUser) {
            const cu = await (authService as any).getCurrentUser();
            if (cu && cu.email) {
              const uu = await (userService as any).getUserByEmail(cu.email);
              const id = uu?.id;
              if (id !== undefined && id !== null && id !== '') {
                const n = Number(id);
                if (!Number.isNaN(n) && Number.isFinite(n)) return n;
              }
            }
          }
        } catch {
          // ignore
        }

        return null;
      };

      const ownerIdNum = await resolveOwnerId();
      let bks: any[] = [];
      if (ownerIdNum !== null) {
        bks = await bookingService.getBookings({ ownerId: ownerIdNum });
      } else {
        bks = await ownerDashboardService.getBookings();
      }
      // Payments info may be embedded in bookings
      setPayments((bks || []).map((b: any) => ({
        id: b.id,
        startDate: b.startDate,
        endDate: b.endDate,
        renterName: b.renterName || b.renter?.name,
        renterEmail: b.renterEmail || (b.renter && b.renter.email),
        amount: b.totalPrice ?? b.TotalPrice ?? 0,
        paymentStatus: b.paymentStatus ?? b.PaymentStatus ?? (b.status === 'confirmed' ? 'paid' : 'pending'),
        transactionId: b.transactionId ?? b.TransactionId ?? null
      })));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  // Map server OwnerBookingDto to UI shape
  function mapOwnerBooking(dto: any) {
    const rawPayment = dto.paymentStatus ?? dto.PaymentStatus ?? 'pending';
    const normalizedPayment = rawPayment === 'succeeded' ? 'paid' : rawPayment;

    const total = dto.totalPrice ?? dto.TotalPrice ?? 0;
    const daily = dto.boatPricePerDay ?? dto.BoatPricePerDay ?? dto.boatPrice ?? dto.BoatPrice ?? 0;

    return {
      id: dto.id,
      boatId: dto.boatId,
      boatName: dto.boatName,
      boatType: dto.boatType || dto.boatType || dto.boatType?.toLowerCase?.() || '',
      boatImage: dto.boatImage,
      renterId: dto.renterId,
      renterName: dto.renterName,
      renterPhone: dto.renterPhone,
      renterEmail: dto.renterEmail,
      startDate: dto.startDate ? new Date(dto.startDate).toLocaleDateString() : '',
      endDate: dto.endDate ? new Date(dto.endDate).toLocaleDateString() : '',
      totalPrice: total,
      subtotal: total,
      dailyPrice: daily,
      ownerRevenue: dto.ownerRevenue ?? dto.OwnerRevenue ?? 0,
      paymentStatus: normalizedPayment,
      status: dto.status ?? dto.Status ?? '',
      createdAt: dto.createdAt ? new Date(dto.createdAt).toLocaleString() : ''
    };
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  async function exportPaymentsCsv() {
    try {
                if (!payments || payments.length === 0) {
                  showAlert('Aucun paiement à exporter.', 'Export CSV');
                  return;
                }

      const headers = ['ID Réservation', 'Locataire', 'Email locataire', 'Dates', 'Montant', 'Statut paiement', 'Transaction'];
      const rows = payments.map((p) => [
        p.id,
        p.renterName ?? '',
        p.renterEmail ?? '',
        `${formatDate(p.startDate)} → ${formatDate(p.endDate)}`,
        (Number(p.amount) || 0).toFixed(2),
        p.paymentStatus ?? '',
        p.transactionId ?? ''
      ]);

      // Semicolon separated; include BOM for Excel compatibility
      const bom = '\uFEFF';
      const csvLines = [headers.join(';'), ...rows.map(r => r.map(cell => String(cell).replace(/"/g, '""')).join(';'))];
      const csv = bom + csvLines.join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showAlert(err?.message || String(err), 'Erreur');
    }
  }

  useEffect(() => {
    let mounted = true;
    async function reloadProfile() {
      try {
        // Prefer ownerDashboardService if it exposes getProfile
        if ((ownerDashboardService as any).getProfile) {
          const p = await (ownerDashboardService as any).getProfile();
          if (!mounted) return;
          setProfileForm({
            id: p?.id,
            firstName: p?.firstName || '',
            lastName: p?.lastName || '',
            email: p?.email || '',
            phone: p?.phone || '',
            avatar: p?.avatar || '',
            memberSince: p?.memberSince || '',
            street: p?.street || '',
            city: p?.city || '',
            state: p?.state || '',
            postalCode: p?.postalCode || '',
            country: p?.country || '',
            roles: (p as any)?.roles || []
          });
          return;
        }

        // Otherwise use authService to get current user
        if ((authService as any).getCurrentUser) {
          const u = await (authService as any).getCurrentUser();
          if (!mounted) return;
          if (u) {
            setProfileForm({
              id: u.id,
              firstName: u.firstName || '',
              lastName: u.lastName || '',
              email: u.email || '',
              phone: u.phone || '',
              avatar: u.avatarUrl || u.avatar || '',
              memberSince: u.memberSince || '',
              street: (u.address && u.address.street) || '',
              city: (u.address && u.address.city) || '',
              state: (u.address && u.address.state) || '',
              postalCode: (u.address && u.address.postalCode) || '',
              country: (u.address && u.address.country) || '',
              roles: u.roles || []
            });
            return;
          }
        }

        // Fallback: try userService.getUserByEmail if available
        if ((userService as any).getUserByEmail && (authService as any).getCurrentUser) {
          const cu = await (authService as any).getCurrentUser();
          if (!mounted) return;
          if (cu && cu.email) {
            const uu = await (userService as any).getUserByEmail(cu.email);
            if (!mounted) return;
            if (uu) {
              setProfileForm({ id: uu.id, firstName: uu.name?.split?.(' ')?.[0] || '', lastName: uu.name?.split?.(' ')?.slice(1).join(' ') || '', email: uu.email, phone: uu.phone, avatar: uu.avatar || '', memberSince: uu.memberSince || '', street: '', city: '', state: '', postalCode: '', country: '', roles: [] });
              return;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    reloadProfile();
    return () => { mounted = false; };
  }, []);

  

  const typeImageMap: Record<string, string> = {
    catamaran: '/images/catamaran.png',
    sailboat: '/images/voiliers.png',
    semirigid: '/images/semi-rigide.jpg',
    motor: '/images/moteur.jpg'
  };
  const typeImageMapWide: Record<string, string> = {
    catamaran: '/images/catamaran-wide.jpg',
    sailboat: '/images/voiliers-wide.jpg',
    semirigid: '/images/semi-rigide-wide.jpg',
    motor: '/images/moteur-wide.jpg'
  };

  const ownerBoats = boats;
  const ownerBookings = bookings;
  const totalRevenue = stats?.revenue ?? 0;
  const pendingBookings = ownerBookings.filter((b: any) => b.status === 'pending');
  // Derived payment metrics
  const formatted = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const computedTotalRevenue = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const thisMonthTotal = payments.reduce((s, p) => {
    const sd = p.startDate ? new Date(p.startDate) : null;
    if (!sd) return s;
    return sd >= startOfMonth && sd <= endOfMonth ? s + (Number(p.amount) || 0) : s;
  }, 0);
  const pendingTotal = payments.reduce((s, p) => s + ((p.paymentStatus === 'pending') ? (Number(p.amount) || 0) : 0), 0);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const futureTotal = payments.reduce((s, p) => {
    const sd = p.startDate ? new Date(p.startDate) : null;
    const isFutureFromNextMonth = sd ? sd >= startOfNextMonth : false;
    return s + (isFutureFromNextMonth ? (Number(p.amount) || 0) : 0);
  }, 0);
  const overlapSum = payments.reduce((s, p) => {
    const sd = p.startDate ? new Date(p.startDate) : null;
    const isFutureFromNextMonth = sd ? sd >= startOfNextMonth : false;
    return s + ((p.paymentStatus === 'pending' && isFutureFromNextMonth) ? (Number(p.amount) || 0) : 0);
  }, 0);
  const upcomingPaymentsTotal = pendingTotal + futureTotal - overlapSum;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">Espace propriétaire</h2>
          <p className="text-gray-600">Gérez vos bateaux et vos réservations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-ocean-600 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl mb-3">
                  {profileForm?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileForm.avatar} alt={`${profileForm.firstName || ''} ${profileForm.lastName || ''}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="uppercase">{((profileForm?.firstName?.[0] ?? profileForm?.lastName?.[0]) || 'U').toUpperCase()}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-gray-900">{(profileForm?.firstName || profile?.firstName || '') + (profileForm?.lastName || profile?.lastName ? ' ' + (profileForm?.lastName || profile?.lastName) : '') || 'Propriétaire'}</div>
                  <div className="text-sm text-gray-600">{(profileForm?.roles?.includes?.('Owner') || profile?.roles?.includes?.('Owner')) ? 'Propriétaire vérifié' : 'Propriétaire'}</div>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp size={20} />
                  <span>Tableau de bord</span>
                </button>
                <button
                  onClick={() => setActiveTab('boats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'boats'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Ship size={20} />
                  <span>Mes bateaux</span>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={20} />
                  <span>Réservations</span>
                  {pendingBookings.length > 0 && (
                    <Badge variant="warning" size="sm">{pendingBookings.length}</Badge>
                  )}
                </button> 
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'documents'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={20} />
                  <span>Documents</span>
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'revenue'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp size={20} />
                  <span>Revenus</span>
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'calendar'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={20} />
                  <span>Disponibilités</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                 <User size={20} />
                  <span>Profil</span>
                </button>
                <button
                  onClick={() => handleLogout(onLogout)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                {loading && <Card className="p-6">Chargement...</Card>}
                {error && <Card className="p-6 bg-red-50 border-red-200"><div className="text-red-800">Erreur: {error}</div></Card>}
                {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Bateaux</div>
                    <div className="text-3xl text-gray-900 mb-1">{ownerBoats.length}</div>
                    <div className="text-xs text-green-600">+1 ce mois</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Réservations</div>
                    <div className="text-3xl text-gray-900 mb-1">{ownerBookings.length}</div>
                    <div className="text-xs text-orange-600">{pendingBookings.length} en attente</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Revenus totaux</div>
                    <div className="text-3xl text-gray-900 mb-1">{totalRevenue}€</div>
                    <div className="text-xs text-green-600">+15% ce mois</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Taux d'occupation</div>
                    <div className="text-3xl text-gray-900 mb-1">78%</div>
                    <div className="text-xs text-gray-600">Sur 30 jours</div>
                  </Card>
                </div>
                )}

                {/* Recent Bookings */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900">Réservations récentes</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>
                      Voir tout
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {ownerBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={booking.boatImage || typeImageMap[(booking as any).boatType ?? (booking as any).type] || '/images/voiliers.png'}
                            alt={booking.boatName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900">{booking.boatName}</div>
                          <div className="text-sm text-gray-600">{booking.renterName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900">{booking.totalPrice}€</div>
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
                            {booking.status === 'pending' && 'En attente'}
                            {booking.status === 'completed' && 'Terminée'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Alerts */}
                <Card className="p-6 bg-orange-50 border-orange-200">
                  <h4 className="text-orange-900 mb-3">Actions requises</h4>
                  <ul className="space-y-2 text-sm text-orange-800">
                    <li>• {pendingBookings.length} réservation(s) en attente de confirmation</li>
                    <li>• Complétez le calendrier de disponibilités pour "Oceanis 45"</li>
                  </ul>
                </Card>
              </div>
            )}

            {activeTab === 'boats' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-900">Mes bateaux</h3>
                  <Button variant="primary" onClick={() => onNavigate('create-listing')}>
                    <Plus size={20} />
                    Ajouter un bateau
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ownerBoats.map((boat) => (
                    <Card key={boat.id} hover className="overflow-hidden">
                      <div className="relative h-48">
                        <ImageWithFallback
                          src={boat.image || typeImageMapWide[(boat as any).type ?? (boat as any).boatType] || '/images/voiliers-wide.jpg'}
                          alt={boat.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge variant={boat.isActive ? 'success' : 'default'} >
                          {boat.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="p-4 mt-4">
                        <h4 className="text-gray-900 mb-2">{boat.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{boat.location}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-ocean-600">{boat.price ?? 0}€/jour</div>
                            <div className="text-sm text-gray-600">{boat.reviews ?? 0} avis</div>
                        </div>
                          <div className="flex gap-2 items-center">
                            {boat.isVerified === false ? (
                              // Show notice and hide actions when not verified
                              <div className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md">
                                En attente de vérification par un administrateur — votre annonce n'est pas encore visible et ne peut pas être modifiée.
                              </div>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  fullWidth
                                  onClick={() => onNavigate('boat-detail', { boatId: boat.id })}
                                >
                                  <Eye size={16} />
                                  Voir
                                </Button>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  fullWidth
                                  onClick={() => onNavigate('edit-listing', { boatId: boat.id })}
                                >
                                  <Edit size={16} />
                                  Modifier
                                </Button>
                                {/* Icon-only actions: deactivate and delete */}
                                <button
                                  title={boat.isActive ? 'Rendre inactif' : 'Rendre actif'}
                                  onClick={() => {
                                    showConfirm({
                                      title: boat.isActive ? 'Rendre le bateau inactif' : 'Activer le bateau',
                                      message: boat.isActive ? 'Voulez-vous rendre ce bateau inactif ? Il ne sera plus visible dans les recherches.' : 'Voulez-vous réactiver ce bateau ?',
                                      confirmLabel: boat.isActive ? 'Rendre inactif' : 'Réactiver',
                                      cancelLabel: 'Annuler',
                                      onConfirm: async () => {
                                        try {
                                          if ((boatService as any).setActive) {
                                            await (boatService as any).setActive(boat.id, !boat.isActive);
                                          } else if ((ownerDashboardService as any).setBoatActive) {
                                            await (ownerDashboardService as any).setBoatActive(boat.id, !boat.isActive);
                                          } else {
                                            showAlert('Impossible de changer le statut du bateau : méthode API indisponible.', 'Erreur');
                                            return;
                                          }

                                          showAlert(boat.isActive ? 'Bateau rendu inactif' : 'Bateau réactivé', 'Bateau');

                                          // reload boats
                                          try {
                                            const bts = await ownerDashboardService.getBoats();
                                            setBoats(bts || []);
                                          } catch {}
                                        } catch (err: any) {
                                          showAlert(err?.message || String(err), 'Erreur');
                                        }
                                      }
                                    });
                                  }}
                                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
                                >
                                  <Slash size={16} />
                                </button>
                                <button
                                  title="Supprimer le bateau"
                                  onClick={() => {
                                    showConfirm({
                                      title: 'Supprimer le bateau',
                                      message: 'Cette action est irréversible. Voulez-vous supprimer ce bateau ?',
                                      confirmLabel: 'Supprimer',
                                      cancelLabel: 'Annuler',
                                      onConfirm: async () => {
                                        try {
                                          if ((boatService as any).deleteBoat) {
                                            await (boatService as any).deleteBoat(boat.id);
                                          } else if ((ownerDashboardService as any).deleteBoat) {
                                            await (ownerDashboardService as any).deleteBoat(boat.id);
                                          } else {
                                            showAlert('Impossible de supprimer le bateau : méthode API indisponible.', 'Erreur');
                                            return;
                                          }

                                          showAlert('Bateau supprimé', 'Bateau');

                                          // reload boats
                                          try {
                                            const bts = await ownerDashboardService.getBoats();
                                            setBoats(bts || []);
                                          } catch {}
                                        } catch (err: any) {
                                          showAlert(err?.message || String(err), 'Erreur');
                                        }
                                      }
                                    });
                                  }}
                                  className="inline-flex items-center justify-center p-2 rounded-md text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Toutes les réservations</h3>
                <div className="space-y-4">
                    {ownerBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg hover:border-ocean-300 transition-colors overflow-hidden"
                    >
                      {/* Main booking info */}
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={booking.boatImage || typeImageMap[(booking as any).boatType ?? (booking as any).type] || '/images/voiliers.png'}
                            alt={booking.boatName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-gray-900 mb-1">{booking.boatName}</h4>
                              <div className="text-sm text-gray-600">
                                Locataire: {booking.renterName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {booking.startDate} → {booking.endDate}
                              </div>
                            </div>
                            <Badge
                              variant={
                                booking.status === 'confirmed'
                                  ? 'success'
                                  : booking.status === 'pending'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {booking.status === 'confirmed' && 'Confirmée'}
                              {booking.status === 'cancelled' && 'Annulée'}
                              {booking.status === 'pending' && 'En attente'}
                              {booking.status === 'completed' && 'Terminée'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Réf: {booking.id}
                            </div>
                            <div className="text-ocean-600">{booking.totalPrice}€</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed info - expandable section */}
                      <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Prix journalier</div>
                            <div className="text-sm text-gray-900">{booking.dailyPrice}€ / jour</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Sous-total</div>
                            <div className="text-sm text-gray-900">{booking.subtotal}€</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Votre revenu</div>
                            <div className="text-sm text-green-600">{booking.ownerRevenue ?? booking.totalPrice ?? 0}€</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Contact locataire</div>
                            <div className="text-sm text-gray-900">{booking.renterEmail}</div>
                            {booking.renterPhone && (
                              <div className="text-sm text-gray-600">{booking.renterPhone}</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Statut de paiement</div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  booking.paymentStatus === 'paid'
                                    ? 'success'
                                    : booking.paymentStatus === 'pending'
                                    ? 'warning'
                                    : 'default'
                                }
                              >
                                {booking.paymentStatus === 'paid' && '✓ Payé'}
                                {booking.paymentStatus === 'pending' && '⏳ En attente'}
                                {booking.paymentStatus === 'failed' && '✗ Échec'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onNavigate('booking-detail', { bookingId: booking.id })}
                          >
                            Voir les détails
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  showConfirm({
                                    title: 'Refuser la réservation',
                                    message: 'Êtes-vous sûr de vouloir refuser cette réservation ?',
                                    confirmLabel: 'Refuser',
                                    cancelLabel: 'Annuler',
                                    onConfirm: async () => {
                                      try {
                                        await bookingService.cancelBooking(booking.id);
                                        await reloadBookings();
                                        showAlert('Réservation refusée', 'Réservation');
                                      } catch (err: any) {
                                        showAlert(err?.message || String(err), 'Erreur');
                                      }
                                    }
                                  });
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Refuser
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  showConfirm({
                                    title: 'Accepter la réservation',
                                    message: 'Confirmer cette réservation ?',
                                    confirmLabel: 'Accepter',
                                    cancelLabel: 'Annuler',
                                    onConfirm: async () => {
                                      try {
                                        await bookingService.updateBooking({ id: booking.id, status: 'confirmed' });
                                        await reloadBookings();
                                        showAlert('Réservation acceptée', 'Réservation');
                                      } catch (err: any) {
                                        showAlert(err?.message || String(err), 'Erreur');
                                      }
                                    }
                                  });
                                }}
                              >
                                Accepter
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                const email = booking.renterEmail || '';
                                  if (!email) {
                                  showAlert('Adresse email du locataire introuvable.', 'Contact');
                                  return;
                                }
                                const subject = `Réservation ${booking.id} - ${booking.boatName}`;
                                const body = `Bonjour ${booking.renterName || ''}%0D%0A%0D%0AJe vous contacte au sujet de votre réservation ${booking.id} pour le bateau ${booking.boatName} (${booking.startDate} → ${booking.endDate}).%0D%0A%0D%0AMerci.%0D%0A`;
                                const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${body}`;
                                // open mail client
                                try {
                                  window.location.href = mailto;
                                } catch (err) {
                                  window.open(mailto, '_blank');
                                }
                              }}
                            >
                              Contacter le locataire
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-6">Revenus</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <div>
                        <div className="text-sm text-gray-600">Revenus totaux</div>
                        <div className="text-2xl text-gray-900">{formatted(computedTotalRevenue)}€</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => reloadPayments()}>Rafraîchir les paiements</Button>
                        <Button variant="ghost" size="sm" onClick={() => exportPaymentsCsv()}>Exporter CSV</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Ce mois</div>
                        <div className="text-xl text-gray-900">{formatted(thisMonthTotal)}€</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Paiements à venir</div>
                        <div className="text-xl text-gray-900">{formatted(upcomingPaymentsTotal)}€</div>
                      </div>
                    </div>
                    {/* Payments table */}
                    <div className="mt-6">
                      <h4 className="text-lg mb-3">Historique des paiements</h4>
                      {payments.length === 0 ? (
                        <div className="text-sm text-gray-500">Aucun paiement trouvé. Cliquez sur "Rafraîchir les paiements".</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-left">
                            <thead>
                              <tr className="text-xs text-gray-500">
                                <th className="px-3 py-2">ID Réservation</th>
                                <th className="px-3 py-2">Locataire</th>
                                <th className="px-3 py-2">Dates</th>
                                <th className="px-3 py-2">Montant</th>
                                <th className="px-3 py-2">Statut paiement</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments.map((p) => (
                                <tr key={p.id} className="border-t">
                                  <td className="px-3 py-2">{p.id}</td>
                                  <td className="px-3 py-2">{p.renterName ?? p.renterEmail}</td>
                                  <td className="px-3 py-2">{formatDate(p.startDate)} → {formatDate(p.endDate)}</td>
                                  <td className="px-3 py-2">{p.amount}€</td>
                                  <td className="px-3 py-2">{p.paymentStatus}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Mon profil</h3>
                <div className="space-y-6 mt-3">{/* existing profile content unchanged */}</div>
              </Card>
            )}

            {activeTab === 'documents' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Documents</h3>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Ajouter un document</div>
                  <div className="flex gap-2 items-center">
                    <select className="px-3 py-2 border rounded" value={selectedBoatForDoc ?? ''} onChange={(e) => setSelectedBoatForDoc(e.target.value ? parseInt(e.target.value) : null)}>
                      <option value="">-- Sélectionner un bateau --</option>
                      {ownerBoats.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border rounded" value={newDocType} onChange={(e) => setNewDocType(e.target.value)}>
                      <option value={"Permis bateau"}>Permis bateau</option>
                      <option value={"Titre de propriété"}>Titre de propriété</option>
                    </select>
                    <input type="file" onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)} />
                    <Button disabled={docUploading || !newDocFile || !selectedBoatForDoc} onClick={async () => {
                      if (!newDocFile || !selectedBoatForDoc) return;
                      setDocUploading(true);
                      try {
                        const form = new FormData();
                        form.append('file', newDocFile, newDocFile.name);
                        form.append('documentType', newDocType);
                        form.append('boatId', String(selectedBoatForDoc));
                        await userDocumentService.uploadDocument(form);
                        // refresh owner documents
                        const myDocs = await userDocumentService.getMyDocuments();
                        setOwnerDocuments(myDocs || []);
                        setNewDocFile(null);
                        setNewDocType('Permis bateau');
                        showAlert('Document ajouté', 'Documents');
                      } catch (err: any) {
                        showAlert(err?.message || String(err), 'Erreur');
                      } finally {
                        setDocUploading(false);
                      }
                    }}>{docUploading ? 'Envoi...' : 'Ajouter'}</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Group ownerDocuments by boatId */}
                  {(() => {
                    if (!ownerDocuments || ownerDocuments.length === 0) return <div className="text-sm text-gray-500">Aucun document</div>;
                    const grouped: Record<string, any[]> = {};
                    ownerDocuments.forEach((d) => {
                      const key = d.boatId ? String(d.boatId) : 'no-boat';
                      if (!grouped[key]) grouped[key] = [];
                      grouped[key].push(d);
                    });
                    return Object.keys(grouped).map((key) => {
                      const docs = grouped[key];
                      const boat = key === 'no-boat' ? null : ownerBoats.find(b => String(b.id) === key);
                      return (
                        <div key={key} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-gray-900 font-medium">{boat ? boat.name : 'Documents personnels'}</div>
                              {boat && <div className="text-sm text-gray-600">{boat.location}</div>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {docs.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <div className="text-sm text-gray-900">{doc.documentType}</div>
                                  <div className="text-xs text-gray-600">{doc.fileName} • {doc.fileSize ? `${(doc.fileSize/1024).toFixed(1)} KB` : ''}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {doc.documentUrl ? <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-ocean-600 hover:underline">Voir</a> : null}
                                  <Badge variant={doc.isVerified ? 'success' : 'warning'}>{doc.isVerified ? 'Vérifié' : 'Non vérifié'}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </Card>
            )}

            

            {activeTab === 'profile' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Mon profil</h3>
                <div className="space-y-6 mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Prénom</label>
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, firstName: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Nom</label>
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, lastName: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, email: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Téléphone</label>
                          <input
                            type="tel"
                            value={profileForm.phone ?? ''}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, phone: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Rue</label>
                          <input
                            type="text"
                            value={profileForm.street}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, street: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Ville</label>
                          <input
                            type="text"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, city: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">État / Région</label>
                          <input
                            type="text"
                            value={profileForm.state}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, state: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Code postal</label>
                          <input
                            type="text"
                            value={profileForm.postalCode}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, postalCode: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Pays</label>
                          <input
                            type="text"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm((p:any) => ({ ...p, country: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <Button
                          variant="primary"
                          onClick={async () => {
                            setSavingProfile(true);
                            setError(null);
                            try {
                              const updated = await (ownerDashboardService as any).updateProfile(profileForm);
                              setProfile(updated);
                              setProfileForm((p:any) => ({ ...p, ...updated }));
                                                      showAlert('Profil mis à jour', 'Profil');
                            } catch (err: any) {
                              setError(err?.message || String(err));
                            } finally {
                              setSavingProfile(false);
                            }
                          }}
                          disabled={savingProfile}
                        >
                          {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                        <Button variant="ghost" onClick={() => setProfileForm({
                          firstName: profile?.firstName ?? '',
                          lastName: profile?.lastName ?? '',
                          email: profile?.email ?? '',
                          phone: profile?.phone ?? '',
                          memberSince: profile?.memberSince ?? '',
                          avatar: profile?.avatar ?? null,
                          street: profile?.street ?? '',
                          city: profile?.city ?? '',
                          state: profile?.state ?? '',
                          postalCode: profile?.postalCode ?? '',
                          country: profile?.country ?? ''
                        })}>Réinitialiser</Button>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex flex-col items-center">
                      <div className="w-28 h-28 bg-gray-100 rounded-full overflow-hidden mb-4">
                        {profileForm.avatar ? (
                          // show avatar preview if provided
                          // avatar may be a base64 string or URL
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profileForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">{(profileForm.firstName?.[0] ?? profileForm.lastName?.[0] ?? 'U').toUpperCase()}</div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Membre depuis</div>
                      <div className="text-gray-900">{profileForm.memberSince ? new Date(profileForm.memberSince).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-4">Gérer les disponibilités</h3>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez un bateau et gérez ses disponibilités en bloquant ou débloquant des périodes.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm text-gray-700 mb-2">Sélectionner un bateau</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      value={selectedBoatForCalendar}
                      onChange={(e) => setSelectedBoatForCalendar(parseInt(e.target.value))}
                    >
                      {ownerBoats.map((boat) => (
                        <option key={boat.id} value={boat.id}>{boat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Informations du bateau sélectionné */}
                  {ownerBoats.find(b => b.id === selectedBoatForCalendar) && (
                    <div className="mb-6 p-4 bg-ocean-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={ownerBoats.find(b => b.id === selectedBoatForCalendar)!.image || typeImageMap[(ownerBoats.find(b => b.id === selectedBoatForCalendar) as any)!.type ?? ''] || '/images/voiliers.png'}
                            alt={ownerBoats.find(b => b.id === selectedBoatForCalendar)!.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-gray-900">{ownerBoats.find(b => b.id === selectedBoatForCalendar)!.name}</h4>
                          <p className="text-sm text-gray-600">{ownerBoats.find(b => b.id === selectedBoatForCalendar)!.location}</p>
                          <p className="text-sm text-ocean-600">{ownerBoats.find(b => b.id === selectedBoatForCalendar)!.price}€/jour</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Calendrier interactif */}
                <Card className="p-6">
                  <AvailabilityCalendar 
                    boatId={selectedBoatForCalendar} 
                    onUpdate={() => {
                      // Rafraîchir les données si nécessaire
                      console.log('Disponibilités mises à jour');
                    }}
                  />
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
