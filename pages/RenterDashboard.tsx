import  { useEffect, useState } from 'react';
import { useModal } from '../hooks/useModal';
import { Calendar, CreditCard, User, FileText, LogOut, Ship, Clock, CheckCircle } from 'lucide-react';
import { handleLogout } from '../utils/handleLogout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { renterDashboardService, bookingService, userDocumentService } from '../services/ServiceFactory';
import { Page } from '../types/navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface RenterDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onLogout: () => void;
}

export function RenterDashboard({ onNavigate, onLogout }: RenterDashboardProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'documents' | 'payments'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [profileForm, setProfileForm] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    memberSince: '',
    avatar: null,
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [newDocType, setNewDocType] = useState<string>('Pièce d\'identité');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [, profileResp, bks, docs, pays] = await Promise.all([
          renterDashboardService.getStats(),
          renterDashboardService.getProfile(),
          renterDashboardService.getBookings(),
          renterDashboardService.getDocuments(),
          renterDashboardService.getPaymentMethods()
        ]);
        if (!mounted) return;
        setProfile(profileResp || null);
        setBookings(bks || []);
        // prefer API documents from renterDashboardService, otherwise fall back to userDocumentService
        if (docs && docs.length > 0) {
          setDocuments(docs);
        } else {
          try {
            const myDocs = await userDocumentService.getMyDocuments();
            setDocuments(myDocs || []);
          } catch {
            setDocuments([]);
          }
        }
        setPayments(pays || []);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    // ensure documents loaded from userDocumentService if renterDashboardService returned nothing
    (async () => {
      try {
        const myDocs = await userDocumentService.getMyDocuments();
        if (mounted && myDocs && myDocs.length > 0) setDocuments(myDocs);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      memberSince: profile.memberSince ?? '',
      avatar: profile.avatar ?? null,
      street: profile.street ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      postalCode: profile.postalCode ?? '',
      country: profile.country ?? ''
    });
  }, [profile]);

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const { showAlert, showConfirm } = useModal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">Mon espace locataire</h2>
          <p className="text-gray-600">Gérez vos réservations et votre profil</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-ocean-600 rounded-full flex items-center justify-center text-white text-2xl mb-3 overflow-hidden">
                  {profileForm.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileForm.avatar} alt={`${profileForm.firstName || ''} ${profileForm.lastName || ''}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl">{((profileForm.firstName?.[0] + ' ' + profileForm.lastName?.[0]) || 'U').toUpperCase()}</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-gray-900">{(profileForm.firstName || profileForm.lastName) ? `${profileForm.firstName ?? ''} ${profileForm.lastName ?? ''}`.trim() : 'Utilisateur'}</div>
                  <div className="text-sm text-gray-600">{profileForm.email ?? ''}</div>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Ship size={20} />
                  <span>Mes réservations</span>
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
                  <span>Mon profil</span>
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
                  <span>Mes documents</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'payments'
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard size={20} />
                  <span>Paiements</span>
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
            {loading && <Card className="p-6 mb-3">Chargement...</Card>}
            {error && <Card className="p-6 bg-red-50 border-red-200  mb-3"><div className="text-red-800">Erreur: {error}</div></Card>}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-ocean-100 rounded-lg flex items-center justify-center">
                        <Clock className="text-ocean-600" size={24} />
                      </div>
                      <div>
                        <div className="text-2xl text-gray-900">{pendingBookings.length}</div>
                        <div className="text-sm text-gray-600">En attente</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-green-600" size={24} />
                      </div>
                      <div>
                        <div className="text-2xl text-gray-900">{confirmedBookings.length}</div>
                        <div className="text-sm text-gray-600">Confirmées</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="text-gray-600" size={24} />
                      </div>
                      <div>
                        <div className="text-2xl text-gray-900">{completedBookings.length}</div>
                        <div className="text-sm text-gray-600">Terminées</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Bookings List */}
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-6">Mes réservations</h3>
                  <div className="space-y-4 mt-2">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg hover:border-ocean-300 transition-colors overflow-hidden"
                      >
                        {/* Main booking info */}
                        <div
                          className="flex flex-col md:flex-row gap-4 p-4 cursor-pointer"
                          onClick={() => onNavigate('booking-detail', { bookingId: booking.id })}
                        >
                          <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                            <ImageWithFallback
                              src={booking.boatImage}
                              alt={booking.boatName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-gray-900 mb-1">{booking.boatName}</h4>
                                <div className="text-sm text-gray-600">
                                  {(() => {
                                    try {
                                      const s = booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '';
                                      const e = booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '';
                                      return `${s}${s && e ? ' → ' : ''}${e}`;
                                    } catch {
                                      return `${booking.startDate || ''}${booking.startDate && booking.endDate ? ' → ' : ''}${booking.endDate || ''}`;
                                    }
                                  })()}
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
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onNavigate('booking-detail', { bookingId: booking.id })}
                            >
                              Voir les détails complets
                            </Button>
                            {booking.status === 'confirmed' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('boat-detail', { boatId: booking.boatId });
                                  }}
                                >
                                  Voir le bateau
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showAlert('Fonctionnalité de contact en développement', 'Contact');
                                  }}
                                >
                                  Contacter le propriétaire
                                </Button>
                              </>
                            )}
                            {(
                              booking.status === 'pending' ||
                              (booking.status === 'confirmed' && (() => {
                                try {
                                  const start = new Date(booking.startDate);
                                  const now = new Date();
                                  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                  return diffDays >= 7;
                                } catch {
                                  return false;
                                }
                              })())
                            ) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  showConfirm({
                                    title: 'Annuler la réservation',
                                    message: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
                                    confirmLabel: 'Annuler',
                                    cancelLabel: 'Non',
                                    onConfirm: async () => {
                                      const originalStatus = booking.status;
                                      try {
                                        // optimistic UI: mark as cancelling
                                        setBookings((bs) => bs.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));

                                        await bookingService.cancelBooking(booking.id);
                                        showAlert('Réservation annulée', 'Annulation');
                                      } catch (err: any) {
                                        // revert UI
                                        setBookings((bs) => bs.map(b => b.id === booking.id ? { ...b, status: originalStatus } : b));
                                        showAlert(err?.message || 'Erreur lors de l\'annulation', 'Erreur');
                                      }
                                    }
                                  });
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Annuler la réservation
                              </Button>
                            )}
                            {booking.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('leave-review', { bookingId: booking.id, boatId: booking.boatId });
                                }}
                              >
                                Laisser un avis
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
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
                            setSaving(true);
                            setError(null);
                            try {
                              const updated = await renterDashboardService.updateProfile(profileForm);
                              setProfile(updated);
                              setProfileForm((p:any) => ({ ...p, ...updated }));
                              showAlert('Profil mis à jour', 'Profil');
                            } catch (err: any) {
                              setError(err?.message || String(err));
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                        >
                          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
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

            {activeTab === 'documents' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Mes documents</h3>
                <div className="space-y-4">
                  {documents.length === 0 && <div className="text-sm text-gray-500">Aucun document</div>}
                  {documents.map((doc) => {
                    const docType = (doc as any).documentType ?? (doc as any).type ?? 'Document';
                    const docUrl = (doc as any).documentUrl ?? (doc as any).url ?? (doc as any).fileUrl ?? '';
                    const verified = !!((doc as any).verified ?? (doc as any).isVerified ?? false);
                    const uploadedAt = (doc as any).uploadedAt ?? (doc as any).verifiedAt ?? null;
                    return (
                      <div key={doc.id ?? docType + docUrl} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="text-ocean-600" size={24} />
                            <div>
                              <div className="text-gray-900">{docType}</div>
                              <div className="text-sm text-gray-600">{verified ? `Vérifié` : 'Non vérifié'}{uploadedAt ? ` • ${new Date(uploadedAt).toLocaleDateString()}` : ''}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* {docUrl ? (
                              <a href={docUrl} target="_blank" rel="noreferrer" className="text-ocean-600 hover:underline">Voir / Télécharger</a>
                            ) : null} */}
                            <Badge variant={verified ? 'success' : 'warning'}>{verified ? 'Vérifié' : 'Non vérifié'}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <div className="flex gap-2 items-center">
                      <select className="px-3 py-2 border rounded" value={newDocType} onChange={(e) => setNewDocType(e.target.value)}>
                        <option value={"Pièce d'identité"}>Pièce d'identité</option>
                        <option value={"Permis bateau"}>Permis bateau</option>
                      </select>
                      <input type="file" onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)} />
                      <Button disabled={docUploading || !newDocFile} onClick={async () => {
                        if (!newDocFile) return;
                        setDocUploading(true);
                        try {
                          const form = new FormData();
                          form.append('file', newDocFile, newDocFile.name);
                          form.append('documentType', newDocType);
                          // call the userDocumentService API implementation
                          const uploaded = await userDocumentService.uploadDocument(form);
                            if (uploaded) {
                            // refresh list from the API service to ensure server-side data shown
                            const refreshed = await userDocumentService.getMyDocuments();
                            setDocuments(refreshed || []);
                            setNewDocFile(null);
                            setNewDocType("Pièce d'identité");
                            showAlert('Document ajouté', 'Documents');
                          } else {
                            showAlert('Le serveur n\'a pas renvoyé le document', 'Erreur');
                          }
                        } catch (err: any) {
                          console.error('Upload document error', err);
                          showAlert(err?.message || String(err), 'Erreur');
                        } finally {
                          setDocUploading(false);
                        }
                      }}>{docUploading ? 'Envoi...' : 'Ajouter'}</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'payments' && (
              <Card className="p-6">
                <h3 className="text-gray-900 mb-6">Moyens de paiement</h3>
                <div className="space-y-4">
                  {payments.length === 0 && <div className="text-sm text-gray-500">Aucun moyen de paiement enregistré</div>}
                  {payments.map((pm) => {
                    const brand = (pm as any).brand ?? (pm as any).type ?? '';
                    const last4 = (pm as any).last4 ?? '';
                    const expiry = (pm as any).expiration ?? (pm as any).expiry ?? '';
                    const label = (pm as any).label ?? (brand ? `${brand} • **** ${last4}` : pm.id);
                    const sub = `${brand ?? ''}${expiry ? ` • ${expiry}` : ''}`.trim();
                    const isDefault = !!((pm as any).isDefault ?? (pm as any).default ?? (pm as any).is_default);
                    return (
                      <div key={pm.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="text-ocean-600" size={24} />
                            <div>
                              <div className="text-gray-900">{label}</div>
                              <div className="text-sm text-gray-600">{sub}</div>
                            </div>
                          </div>
                          <Badge variant={isDefault ? 'default' : 'info'}>{isDefault ? 'Par défaut' : (last4 ? `•••• ${last4}` : (expiry ? expiry : ''))}</Badge>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="ghost">Ajouter une carte</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
