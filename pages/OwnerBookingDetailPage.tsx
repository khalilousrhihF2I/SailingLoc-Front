import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { bookingService, messageService, authService } from '../services/ServiceFactory';
import { useModal } from '../hooks/useModal';
import { Page } from '../types/navigation';

interface OwnerBookingDetailPageProps {
    bookingId: string;
    onNavigate: (page: Page, data?: any) => void;
}

export function OwnerBookingDetailPage({ bookingId, onNavigate }: OwnerBookingDetailPageProps) {
    const { showAlert, showConfirm } = useModal();
    const [booking, setBooking] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any | null>(null);

    const refreshData = async () => {
        setLoading(true);
        setError(null);
        try {
            const b = await bookingService.getBookingById(bookingId);
            setBooking(b);

            try {
                const me = await authService.getCurrentUser();
                setCurrentUser(me || null);
                if (me && messageService) {
                    const userId = me.id?.toString ? me.id.toString() : String(me.id ?? '');
                    const msgs = await messageService.getMessagesByBookingAndUser(bookingId, userId);
                    setMessages(msgs || []);
                }
            } catch (e) {
                // ignore message loading errors
            }
        } catch (err: any) {
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshData(); }, [bookingId]);

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
    };

    const formatCurrency = (v: number | string | undefined) => {
        try {
            const n = typeof v === 'string' ? Number(v) : (v ?? 0);
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
        } catch {
            return (v ?? '') + ' €';
        }
    };

    const senderLabel = (m: any) => {
        if (!currentUser) return '';
        if (m.senderId === currentUser.id) return 'Vous';
        if (booking?.renterName) return booking.renterName;
        return 'Autre';
    };

    const handleSendMessage = async () => {
        if (!booking || !currentUser) return;
        if (!messageService) {
            showAlert('Messagerie non disponible en mode mock.', 'Messagerie');
            return;
        }
        if (!messageText.trim()) return showAlert('Entrez un message.', 'Messagerie');
        setSending(true);
        try {
            const dto: any = {
                receiverId: booking.renterId?.toString?.() ?? booking.renterId,
                bookingId: booking.id,
                boatId: booking.boatId,
                subject: `Message from owner about booking ${booking.id}`,
                content: messageText.trim()
            };
            const resp = await messageService.ownerToRenter(dto);
            if (!resp.success) throw new Error(resp.message || 'Erreur envoi message');
            setMessages((m) => [...m, { senderId: currentUser.id, receiverId: booking.renterId, content: dto.content, createdAt: new Date().toISOString() }]);
            showAlert(resp.message || 'Message envoyé', 'Messagerie');
            setMessageText('');
        } catch (err: any) {
            showAlert(err?.message || String(err), 'Erreur');
        } finally {
            setSending(false);
        }
    };

    const isOwner = Boolean(currentUser && (
        String(currentUser.role || currentUser.type || '').toLowerCase() === 'owner' ||
        Array.isArray(currentUser.roles) && currentUser.roles.some((r: string) => String(r || '').toLowerCase() === 'owner')
    ));

    const canConfirm = booking && booking.status === 'pending';
    const canCancel = booking && (booking.status === 'pending' || booking.status === 'confirmed');

    const handleConfirm = async () => {
        if (!booking) return;
            try {
            await bookingService.updateBooking({ id: booking.id, status: 'confirmed' });
            await refreshData();
            showAlert('Réservation confirmée', 'Réservation');
        } catch (err: any) {
            showAlert(err?.message || String(err), 'Erreur');
        }
    };

    const handleCancel = async () => {
        if (!booking) return;
        showConfirm({
            title: 'Annuler la réservation',
            message: 'Voulez-vous vraiment annuler cette réservation ?',
            confirmLabel: 'Oui, annuler',
            cancelLabel: 'Non',
            onConfirm: async () => {
                try {
                    await bookingService.cancelBooking(booking.id); 
                    showAlert('Réservation annulée', 'Réservation');
                    await refreshData();
                } catch (err: any) {
                    showAlert(err?.message || String(err), 'Erreur');
                }
            }
        });
    };

    if (loading) return <Card className="p-6">Chargement...</Card>;
    if (error) return <Card className="p-6 bg-red-50 border-red-200"><div className="text-red-800">Erreur: {error}</div></Card>;
    if (!booking) return <Card className="p-6">Réservation introuvable</Card>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                            <Button variant="ghost" onClick={() => onNavigate('owner-dashboard')}>Retour</Button>
                        </div>
                        <div className="flex-5 text-right">
                            <Button className='mr-2' onClick={() => onNavigate('booking-detail', { bookingId: booking.id })} variant="ghost">Voir comme locataire</Button>
                            <Button className='ml-3' size="sm" variant="primary" onClick={() => onNavigate('edit-listing', { boatId: booking.boatId })}>Gérer l'annonce</Button>
                            <Button className='ml-3' variant="danger" onClick={handleCancel} disabled={!canCancel}>Annuler réservation</Button>
                            {canConfirm && <Button className='ml-3' variant="secondary" onClick={handleConfirm}>Confirmer réservation</Button>}
                        </div>
                    </div>

                <Card className="p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">Réf: <span className="font-medium">{booking.id}</span></div>
                        <div className="flex-1 text-right">
                            <Button className='ml-3' size="sm" variant="ghost" onClick={() => { try { navigator.clipboard?.writeText(booking.id); showAlert('Référence copiée', 'Référence'); } catch { showAlert('Copier la référence: ' + booking.id, 'Référence'); } }}>Copier la référence</Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-48 h-40 rounded-lg overflow-hidden">
                            <ImageWithFallback src={booking.boatImage} alt={booking.boatName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">{booking.boatName}</h3>
                                    <div className="text-sm text-gray-600">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</div>
                                </div>
                                <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'default'}>
                                    {booking.status}
                                </Badge>
                            </div>

                            <div className="mt-4 flex items-start justify-between ">
                                <div>
                                    <Button className='mr-2' onClick={() => onNavigate('boat-detail', { boatId: booking.boatId })} variant="ghost">Voir le bateau</Button>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">Prix total</div>
                                    <div className="text-2xl text-gray-900 font-semibold">{formatCurrency(booking.totalPrice)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-ocean-100 text-ocean-700 rounded-full flex items-center justify-center text-lg font-semibold">{(booking.renterName ? (booking.renterName.split(' ').map((s: string) => s[0]).slice(0, 2).join('')) : (booking.renterEmail ? booking.renterEmail[0] : 'U')).toUpperCase()}</div>
                                    <div>
                                        <div className="text-sm text-gray-600">Locataire</div>
                                        <div className="text-gray-900 font-medium">{booking.renterName ?? booking.renterEmail ?? '—'}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            {booking.renterEmail ? (
                                                <a href={`mailto:${booking.renterEmail}`} className="text-sm text-ocean-600 hover:underline">Envoyer un email</a>
                                            ) : null}
                                            {booking.renterPhoneNumber ? (
                                                <a href={`tel:${booking.renterPhoneNumber}`} className="text-sm text-ocean-600 hover:underline">Appeler</a>
                                            ) : null}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="border-b mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button className="py-3 px-1 border-b-2 border-ocean-600 text-ocean-600">Messages</button>
                            <button className="py-3 px-1 text-gray-500">Notes</button>
                        </nav>
                    </div>

                    <div>
                        <div className="mb-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1">
                                    <h5 className="text-sm font-medium mb-2">Historique des messages</h5>
                                </div>
                                <div className="flex-2 text-right">
                                    <Button className='mr-2' onClick={() => refreshData()} variant="ghost">Rafraîchir</Button>
                                </div>
                            </div>
                            {messages.length === 0 && <div className="text-sm text-gray-500">Pas encore de messages — vous pouvez envoyer le premier message au locataire ci-dessous.</div>}
                            {messages.map((m, idx) => {
                                const isFromRenter = booking && String(m.senderId) === String(booking.renterId);
                                const alignClass = isFromRenter ? 'justify-start' : 'justify-end';
                                const bubbleBg = isFromRenter ? 'bg-ocean-50 border-ocean-100 text-gray-800' : 'bg-green-50 border-green-100 text-gray-800';
                                const textXs = 'text-xs text-gray-500';
                                return (
                                    <div key={idx} className={`mb-3 flex ${alignClass}`}>
                                        <div className={`max-w-[75%] p-3 border rounded-md ${bubbleBg}`}>
                                            <div className={textXs}>{senderLabel(m)} • {new Date(m.createdAt).toLocaleString()}</div>
                                            <div className="text-sm">{m.content}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div>
                            <h5 className="text-sm font-medium mb-2">Nouveau message</h5>
                            {isOwner ? (
                                <>
                                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} className="w-full p-3 border border-gray-300 rounded-lg mb-2" />
                                    <div className="flex gap-3">
                                        <Button onClick={handleSendMessage} disabled={sending || !messageService}>{sending ? 'Envoi...' : 'Envoyer au locataire'}</Button>
                                        <Button variant="ghost" onClick={() => setMessageText('')}>Réinitialiser</Button>
                                    </div>
                                    {!messageService && (
                                        <div className="text-xs text-gray-500 mt-2">Messagerie non configurée (mode mock). Activez le service messages pour envoyer des messages.</div>
                                    )}
                                </>
                            ) : (
                                <div className="text-sm text-gray-600">Connectez-vous en tant que propriétaire pour envoyer un message.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OwnerBookingDetailPage;
