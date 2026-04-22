import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { bookingService, messageService, authService } from '../services/ServiceFactory';
import { useModal } from '../hooks/useModal';
import { Page } from '../types/navigation';
import { ArrowLeft, Copy, Download, AlertTriangle, Star, Send, Ship, Calendar } from 'lucide-react';

interface BookingDetailPageProps {
    bookingId: string;
    onNavigate: (page: Page, data?: any) => void;
}

const translateStatus = (s: string) => {
    const map: Record<string, string> = { confirmed: 'Confirmée', pending: 'En attente', completed: 'Terminée', cancelled: 'Annulée' };
    return map[s] || s;
};
const statusVariant = (s: string): 'success' | 'warning' | 'default' => {
    if (s === 'confirmed') return 'success';
    if (s === 'pending') return 'warning';
    return 'default';
};

export function BookingDetailPage({ bookingId, onNavigate }: BookingDetailPageProps) {
    const { showAlert, showConfirm } = useModal();
    const [booking, setBooking] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const b = await bookingService.getBookingById(bookingId);
                if (!mounted) return;
                setBooking(b);
                try {
                    const me = await authService.getCurrentUser();
                    if (!mounted) return;
                    setCurrentUser(me || null);
                    if (me && messageService) {
                        const userId = me.id?.toString ? me.id.toString() : String(me.id ?? '');
                        const msgs = await messageService.getMessagesByBookingAndUser(bookingId, userId);
                        if (!mounted) return;
                        setMessages(msgs || []);
                    }
                } catch { /* ignore message loading errors */ }
            } catch (err: any) {
                setError(err?.message || String(err));
            } finally { if (mounted) setLoading(false); }
        })();
        return () => { mounted = false; };
    }, [bookingId]);

    // Scroll to messages section if requested via query string (?scrollTo=messages)
    useEffect(() => {
        if (loading) return;
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('scrollTo') === 'messages') {
                const el = document.getElementById('messages');
                if (el) {
                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }
            }
        } catch { /* ignore */ }
    }, [loading, messages.length]);

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return iso; }
    };

    const formatCurrency = (v: number | string | undefined) => {
        try {
            const n = typeof v === 'string' ? Number(v) : (v ?? 0);
            return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
        } catch { return (v ?? '') + ' €'; }
    };

    const senderLabel = (m: any) => {
        if (!currentUser) return '';
        if (m.senderId === currentUser.id) return 'Vous';
        if (booking?.ownerName) return booking.ownerName;
        return 'Autre';
    };

    const handleSendMessage = async () => {
        if (!booking || !currentUser) return;
        if (!messageService) { showAlert('Messagerie non disponible en mode mock.', 'Messagerie'); return; }
        if (!messageText.trim()) return showAlert('Entrez un message.', 'Messagerie');
        setSending(true);
        try {
            const dto: any = {
                receiverId: booking.ownerId?.toString?.() ?? booking.ownerId,
                bookingId: booking.id, boatId: booking.boatId,
                subject: `Message from renter about booking ${booking.id}`,
                content: messageText.trim()
            };
            const resp = await messageService.renterToOwner(dto);
            if (!resp.success) throw new Error(resp.message || 'Erreur envoi message');
            setMessages((m) => [...m, { senderId: currentUser.id, receiverId: booking.ownerId, content: dto.content, createdAt: new Date().toISOString() }]);
            showAlert(resp.message || 'Message envoyé', 'Messagerie');
            setMessageText('');
        } catch (err: any) { showAlert(err?.message || String(err), 'Erreur'); } finally { setSending(false); }
    };

    const handleDownloadInvoice = async () => {
        if (!booking) return;
        try {
            const res = await bookingService.downloadInvoice(booking.id);
            if (res.error) { showAlert('Erreur téléchargement facture: ' + res.error, 'Facture'); window.print(); return; }
            const blob = res.blob;
            if (!blob || blob.size === 0) { showAlert('Le serveur a renvoyé un fichier vide.', 'Facture'); window.print(); return; }
            let filename = `facture-${booking.id}.pdf`;
            if (res.filename) {
                const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(res.filename);
                if (m) filename = decodeURIComponent((m[1] || m[2] || filename));
            }
            const performDownload = () => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = downloadUrl; a.download = filename;
                document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(downloadUrl);
            };
            const contentType = (res.contentType || '').toLowerCase();
            if (contentType && !contentType.includes('pdf')) {
                showConfirm({ title: 'Facture', message: 'Le fichier reçu ne semble pas être un PDF. Voulez-vous tout de même le télécharger ?', confirmLabel: 'Télécharger', cancelLabel: 'Annuler', onConfirm: async () => performDownload() });
            } else { performDownload(); }
        } catch (err: any) {
            showAlert('Erreur lors du téléchargement de la facture: ' + (err?.message || String(err)), 'Facture');
            try { window.print(); } catch { /* ignore */ }
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center"><div className="text-gray-500">Chargement de la réservation...</div></div>;
    if (error) return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8"><div className="max-w-5xl mx-auto px-4"><Alert type="error">Erreur : {error}</Alert></div></div>;
    if (!booking) return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8"><div className="max-w-5xl mx-auto px-4"><Alert type="warning">Réservation introuvable</Alert></div></div>;

    const canLeaveReview = booking.status === 'completed';

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back + Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <Button variant="ghost" onClick={() => onNavigate('renter-dashboard')}>
                        <ArrowLeft size={18} /> Retour au tableau de bord
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { try { navigator.clipboard?.writeText(booking.id); showAlert('Référence copiée', 'Référence'); } catch { showAlert('Copier la référence: ' + booking.id, 'Référence'); } }}>
                            <Copy size={14} /> Copier réf.
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleDownloadInvoice}>
                            <Download size={14} /> Facture
                        </Button>
                        <Button size="sm" variant="primary" disabled={!canLeaveReview} onClick={() => { if (!canLeaveReview) return showAlert('Vous pouvez laisser un avis une fois la réservation terminée.', 'Avis'); onNavigate('leave-review', { bookingId: booking.id, boatId: booking.boatId }); }}>
                            <Star size={14} /> Laisser un avis
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onNavigate('contact', { prefill: { bookingId: booking.id, reference: booking.id, subject: `Problème réservation ${booking.id}` } })}>
                            <AlertTriangle size={14} /> Signaler
                        </Button>
                    </div>
                </div>

                {/* Booking Summary */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">Réf: <span className="font-mono font-medium text-gray-700">{booking.id}</span></div>
                        <Badge variant={statusVariant(booking.status)}>{translateStatus(booking.status)}</Badge>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden shrink-0">
                            <ImageWithFallback src={booking.boatImage} alt={booking.boatName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-1">{booking.boatName}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => onNavigate('boat-detail', { boatId: booking.boatId })}>
                                    <Ship size={14} /> Voir le bateau
                                </Button>
                            </div>
                            <div className="text-right mt-3">
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Prix total</div>
                                <div className="text-2xl font-semibold text-gray-900">{formatCurrency(booking.totalPrice)}</div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Owner Contact */}
                <Card className="p-5 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-ocean-100 text-ocean-700 rounded-full flex items-center justify-center text-lg font-semibold shrink-0">
                            {(booking.ownerName ? booking.ownerName.split(' ').map((s: string) => s[0]).slice(0, 2).join('') : (booking.ownerEmail ? booking.ownerEmail[0] : 'U')).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Propriétaire</div>
                            <div className="text-gray-900 font-medium">{booking.ownerName ?? booking.ownerEmail ?? '—'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            {booking.ownerEmail && <a href={`mailto:${booking.ownerEmail}`} className="text-sm text-ocean-600 hover:underline">Email</a>}
                            {booking.ownerPhoneNumber && <a href={`tel:${booking.ownerPhoneNumber}`} className="text-sm text-ocean-600 hover:underline">Appeler</a>}
                        </div>
                    </div>
                </Card>

                {/* Messages Section */}
                <div id="messages">
                <Card className="p-6">
                    <h3 className="text-gray-900 font-semibold mb-4">Messages</h3>

                    {messages.length === 0 && <div className="text-sm text-gray-500 mb-4">Aucun message — envoyez le premier message au propriétaire ci-dessous.</div>}

                    {messages.length > 0 && (
                        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-1">
                            {messages.map((m, idx) => {
                                const isFromOwner = booking && String(m.senderId) === String(booking.ownerId);
                                return (
                                    <div key={idx} className={`flex ${isFromOwner ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[75%] p-3 rounded-xl ${isFromOwner ? 'bg-gray-100 text-gray-800' : 'bg-ocean-50 text-gray-800'}`}>
                                            <div className="text-[11px] text-gray-500 mb-1">{senderLabel(m)} • {new Date(m.createdAt).toLocaleString()}</div>
                                            <div className="text-sm">{m.content}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-end gap-3 pt-4 border-t border-gray-200">
                        <div className="flex-1">
                            <Input
                                placeholder="Écrire un message au propriétaire..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            />
                        </div>
                        <Button variant="primary" onClick={handleSendMessage} disabled={sending || !messageText.trim()}>
                            <Send size={16} /> {sending ? 'Envoi...' : 'Envoyer'}
                        </Button>
                    </div>
                </Card>
                </div>
            </div>
        </div>
    );
}
