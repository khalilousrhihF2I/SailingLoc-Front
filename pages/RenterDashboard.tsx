import  { useEffect, useState } from 'react';
import { useModal } from '../hooks/useModal';
import { Calendar, CreditCard, User, FileText, LogOut, Ship, Clock, CheckCircle } from 'lucide-react';
import { handleLogout } from '../utils/handleLogout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { DashboardShell, StatCard } from '../components/ui/DashboardShell';
import { TablePagination } from '../components/ui/TablePagination';
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
  const [bookingsPage, setBookingsPage] = useState(1);
  const RENTER_PAGE_SIZE = 10;
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
    <DashboardShell
      title="Mon espace locataire"
      subtitle="Gérez vos réservations et votre profil"
      navItems={[
        { id: 'bookings', label: 'Mes réservations', icon: <Ship size={20} /> },
        { id: 'profile', label: 'Mon profil', icon: <User size={20} /> },
        { id: 'documents', label: 'Mes documents', icon: <FileText size={20} /> },
        { id: 'payments', label: 'Paiements', icon: <CreditCard size={20} /> },
        { id: 'logout', label: 'Déconnexion', icon: <LogOut size={20} />, variant: 'danger' as const },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => {
        if (id === 'logout') { handleLogout(onLogout); return; }
        setActiveTab(id as any);
      }}
      sidebarHeader={
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xl mb-3 overflow-hidden">
            {profileForm.avatar ? (
              <img src={profileForm.avatar} alt={`${profileForm.firstName || ''} ${profileForm.lastName || ''}`} className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">{((profileForm.firstName?.[0] ?? '') + (profileForm.lastName?.[0] ?? '') || 'U').toUpperCase()}</span>
            )}
          </div>
          <div className="text-gray-900 font-medium text-sm">{(profileForm.firstName || profileForm.lastName) ? `${profileForm.firstName ?? ''} ${profileForm.lastName ?? ''}`.trim() : 'Utilisateur'}</div>
          <div className="text-xs text-gray-500">{profileForm.email ?? ''}</div>
        </div>
      }
    >
      {/* Loading / Error states */}
      {loading && <Card className="p-6 text-center text-gray-500 mb-3">Chargement des données...</Card>}
      {error && <Alert type="error">Erreur : {error}</Alert>}

      {activeTab === 'bookings' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="En attente" value={pendingBookings.length} icon={<Clock className="text-ocean-600" size={22} />} iconBg="bg-ocean-100" />
                  <StatCard label="Confirmées" value={confirmedBookings.length} icon={<CheckCircle className="text-green-600" size={22} />} iconBg="bg-green-100" />
                  <StatCard label="Terminées" value={completedBookings.length} icon={<Calendar className="text-gray-600" size={22} />} iconBg="bg-gray-100" />
                </div>

                {/* Bookings List */}
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-6">Mes réservations</h3>
                  <div className="space-y-4 mt-2">
                    {bookings.slice((bookingsPage - 1) * RENTER_PAGE_SIZE, bookingsPage * RENTER_PAGE_SIZE).map((booking) => (
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
                  <TablePagination
                    currentPage={bookingsPage}
                    totalPages={Math.ceil(bookings.length / RENTER_PAGE_SIZE)}
                    onPageChange={setBookingsPage}
                    totalItems={bookings.length}
                  />
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
                        <Input label="Prénom" type="text" value={profileForm.firstName} onChange={(e) => setProfileForm((p:any) => ({ ...p, firstName: e.target.value }))} />
                        <Input label="Nom" type="text" value={profileForm.lastName} onChange={(e) => setProfileForm((p:any) => ({ ...p, lastName: e.target.value }))} />
                        <Input label="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p:any) => ({ ...p, email: e.target.value }))} />
                        <Input label="Téléphone" type="tel" value={profileForm.phone ?? ''} onChange={(e) => setProfileForm((p:any) => ({ ...p, phone: e.target.value }))} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <Input label="Rue" type="text" value={profileForm.street} onChange={(e) => setProfileForm((p:any) => ({ ...p, street: e.target.value }))} />
                        <Input label="Ville" type="text" value={profileForm.city} onChange={(e) => setProfileForm((p:any) => ({ ...p, city: e.target.value }))} />
                        <Input label="État / Région" type="text" value={profileForm.state} onChange={(e) => setProfileForm((p:any) => ({ ...p, state: e.target.value }))} />
                        <Input label="Code postal" type="text" value={profileForm.postalCode} onChange={(e) => setProfileForm((p:any) => ({ ...p, postalCode: e.target.value }))} />
                        <Input label="Pays" type="text" value={profileForm.country} onChange={(e) => setProfileForm((p:any) => ({ ...p, country: e.target.value }))} />
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
    </DashboardShell>
  );
}
