import  { useEffect, useState } from 'react';
import { MapPin, Users, Anchor, Calendar, Star, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Modal } from '../components/ui/Modal';
import { Page } from '../types/navigation';
import { boatService, availabilityService } from '../services/ServiceFactory';

interface BoatDetailPageProps {
  boatId: number;
  onNavigate: (page: Page, data?: any) => void;
}

export function BoatDetailPage({ boatId, onNavigate }: BoatDetailPageProps) {
  const [boat, setBoat] = useState<any | null>(null);
  const [boatReviews, setBoatReviews] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [unavailablePeriods, setUnavailablePeriods] = useState<any[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    boatService.getBoatById(boatId)
      .then((b: any) => {
        if (!mounted) return;
        if (!b) {
          setBoat(null);
          setBoatReviews([]);
          return;
        }

        // normalize equipment which may be JSON string
        let equipment: string[] = [];
        try {
          if (typeof b.equipment === 'string') equipment = JSON.parse(b.equipment);
          else if (Array.isArray(b.equipment)) equipment = b.equipment;
        } catch (e) {
          equipment = String(b.equipment || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const reviewsArr = Array.isArray(b.reviews) ? b.reviews : [];

        const normalized = {
          ...b,
          equipment,
          reviews: reviewsArr.length,
          image: b.image || ''
        };
        // set main image from images array if available (supports array of URLs or objects)
        const main = b.image
          || (Array.isArray(b.images) && b.images.length > 0
            ? (typeof b.images[0] === 'string' ? b.images[0] : b.images[0]?.imageUrl || b.images[0]?.image)
            : null)
          || null;
        setBoat(normalized);
        setMainImage(main);
        setBoatReviews(reviewsArr);
      })
      .catch((err) => {
        console.error('Error loading boat', err);
        setBoat(null);
        setBoatReviews([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [boatId]);

  // fetch unavailable periods for the boat to enforce disabled dates
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const periods = await availabilityService.getUnavailableDates(boatId);
        if (!mounted) return;
        setUnavailablePeriods(periods || []);
      } catch (e) {
        console.error('Error fetching unavailable periods', e);
        if (!mounted) return;
        setUnavailablePeriods([]);
      }
    })();

    return () => { mounted = false; };
  }, [boatId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Bateau non trouvé</p>
      </div>
    );
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const days = calculateDays();
  const subtotal = days * boat.price;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const typeLabels: Record<string, string> = {
    sailboat: 'Voilier',
    catamaran: 'Catamaran',
    motor: 'Moteur',
    semirigid: 'Semi-rigide'
  };

  const toDate = (d: string) => {
    if (!d) return new Date('');
    // Accept either full ISO (`YYYY-MM-DDTHH:mm:ss`) or date-only (`YYYY-MM-DD`)
    try {
      return new Date(d);
    } catch (e) {
      return new Date(d + 'T00:00:00');
    }
  };

  const isDateInUnavailable = (dateStr: string) => {
    if (!dateStr) return false;
    const d = toDate(dateStr).getTime();
    return unavailablePeriods.some((p: any) => {
      // skip ranges explicitly marked as available
      if (p.type === 'available' || p.isAvailable === true) return false;
      const s = toDate(p.startDate).getTime();
      const e = toDate(p.endDate).getTime();
      return d >= s && d <= e;
    });
  };

  const rangeOverlapsUnavailable = (start: string, end: string) => {
    if (!start || !end) return false;
    const s = toDate(start).getTime();
    const e = toDate(end).getTime();
    return unavailablePeriods.some((p: any) => {
      if (p.type === 'available' || p.isAvailable === true) return false;
      const ps = toDate(p.startDate).getTime();
      const pe = toDate(p.endDate).getTime();
      return !(e < ps || s > pe);
    });
  };

  const tomorrowIso = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  })();

  const handleStartChange = (val: string) => {
    setDateError(null);
    // enforce min tomorrow
    if (val < tomorrowIso) {
      setDateError('La date de début doit être au moins demain.');
      setStartDate('');
      return;
    }
    if (isDateInUnavailable(val)) {
      setDateError('La date de début sélectionnée n\'est pas disponible.');
      setStartDate('');
      return;
    }
    // if endDate exists, ensure start <= end and range not overlapping
    if (endDate && val > endDate) {
      setDateError('La date de début ne peut pas être après la date de fin.');
      setStartDate('');
      return;
    }
    if (endDate && rangeOverlapsUnavailable(val, endDate)) {
      setDateError('La période sélectionnée chevauche une indisponibilité.');
      setStartDate('');
      return;
    }
    setStartDate(val);
  };

  const handleEndChange = (val: string) => {
    setDateError(null);
    if (!startDate) {
      setDateError('Veuillez sélectionner d\'abord une date de début.');
      setEndDate('');
      return;
    }
    if (val < startDate) {
      setDateError('La date de fin ne peut pas être antérieure à la date de début.');
      setEndDate('');
      return;
    }
    if (isDateInUnavailable(val) || rangeOverlapsUnavailable(startDate, val)) {
      setDateError('La période sélectionnée chevauche une indisponibilité.');
      setEndDate('');
      return;
    }
    setEndDate(val);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 h-96 rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={mainImage || ''}
                alt={boat.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 mt-3">
              {((boat.images && boat.images.length > 0) ? boat.images : [boat.image]).map((img: any, i: number) => {
                const url = typeof img === 'string' ? img : (img?.imageUrl || img?.image);
                if (!url) return null;
                return (
                  <button
                    key={i}
                    onClick={() => { setModalIndex(i); setIsModalOpen(true); }}
                    className={url === mainImage ? 'w-20 h-14 rounded-lg overflow-hidden border ring-2 ring-ocean-400' : 'w-20 h-14 rounded-lg overflow-hidden border border-gray-200'}
                  >
                    <ImageWithFallback src={url} alt={'thumb-' + i} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-gray-900 mb-2">{boat.name}</h2>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                          <MapPin size={18} />
                          <button className="text-left text-ocean-600 underline" onClick={() => onNavigate('destinations', { destinationId: boat.destinationId })}>
                            {boat.location}
                          </button>
                    </div>
                    <Badge variant="info">{typeLabels[boat.type]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-orange-500 fill-orange-500" />
                  <span className="text-xl text-gray-900">{boat.rating}</span>
                  <span className="text-gray-500">({boat.reviews} avis)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <Users className="text-ocean-600 mx-auto mb-2" size={24} />
                  <div className="text-sm text-gray-600">Capacité</div>
                  <div className="text-gray-900">{boat.capacity} pers.</div>
                </div>
                <div className="text-center">
                  <Anchor className="text-ocean-600 mx-auto mb-2" size={24} />
                  <div className="text-sm text-gray-600">Longueur</div>
                  <div className="text-gray-900">{boat.length} ft</div>
                </div>
                <div className="text-center">
                  <Calendar className="text-ocean-600 mx-auto mb-2" size={24} />
                  <div className="text-sm text-gray-600">Année</div>
                  <div className="text-gray-900">{boat.year}</div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed mt-2">{boat.description}</p>
            </Card>

            {/* Equipment */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Équipements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3  mt-2">
                {boat.equipment.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Specifications */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-4  mt-2">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Cabines</div>
                  <div className="text-gray-900">{boat.cabins} cabines</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Capacité</div>
                  <div className="text-gray-900">{boat.capacity} personnes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Type</div>
                  <div className="text-gray-900">{typeLabels[boat.type]}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Année</div>
                  <div className="text-gray-900">{boat.year}</div>
                </div>
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-6">Avis des locataires</h3>
              <div className="space-y-6  mt-2">
                {boatReviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-ocean-600 rounded-full flex items-center justify-center text-white shrink-0">
                        {review.userAvatar ? review.userAvatar : getInitials(review.userName)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-gray-900">{review.userName}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Owner */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Propriétaire</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-16 h-16 bg-ocean-600 rounded-full flex items-center justify-center text-white text-xl">
                  {boat.owner.avatar ? boat.owner.avatar : getInitials(boat.owner.name)}
                </div>
                <div>
                  <div className="text-gray-900">{boat.owner.name}</div>
                  <div className="text-sm text-gray-600">Membre depuis 2023</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Availability calendar removed: using date inputs with server-driven unavailable periods */}

              <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl text-gray-900 mb-1">
                  {boat.price}€
                  <span className="text-base text-gray-500">/jour</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    min={tomorrowIso}
                    onChange={(e) => handleStartChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || tomorrowIso}
                    onChange={(e) => handleEndChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>

                {dateError && (
                  <div className="text-sm text-red-600 mt-2">{dateError}</div>
                )}
              </div>

              {days > 0 && (
                <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>{boat.price}€ × {days} jours</span>
                    <span>{subtotal}€</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Frais de service (10%)</span>
                    <span>{serviceFee}€</span>
                  </div>
                </div>
              )}

              {days > 0 && (
                <div className="flex justify-between mb-6 text-xl">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{total}€</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={days === 0}
                onClick={() => onNavigate('booking-step1', { boatId: boat.id, startDate, endDate })}
              >
                Réserver maintenant
              </Button>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Shield size={16} className="text-green-500" />
                <span>Paiement sécurisé - Annulation gratuite</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* Image modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setModalIndex(null); }}
          title={boat?.name || 'Photo'}
          size="xl"
          footer={(
            <div className="w-full flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {typeof modalIndex === 'number' && boat?.images && boat.images[modalIndex]?.caption ? boat.images[modalIndex].caption : ''}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (modalIndex === null) return;
                    const prev = modalIndex - 1;
                    const max = (boat?.images && boat.images.length) ? boat.images.length - 1 : 0;
                    setModalIndex(prev >= 0 ? prev : max);
                  }}
                  className="px-3 py-2 bg-gray-100 rounded-md"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (modalIndex === null) return;
                    const next = modalIndex + 1;
                    const max = (boat?.images && boat.images.length) ? boat.images.length - 1 : 0;
                    setModalIndex(next <= max ? next : 0);
                  }}
                  className="px-3 py-2 bg-gray-100 rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        >
          {typeof modalIndex === 'number' && (
            (() => {
              const imgEntry = (boat?.images && boat.images.length > 0) ? boat.images[modalIndex] : (modalIndex === 0 ? boat.image : null);
              const url = typeof imgEntry === 'string' ? imgEntry : (imgEntry?.imageUrl || imgEntry?.image);
              return url ? (
                <div className="w-full h-[70vh] flex items-center justify-center">
                  <ImageWithFallback src={url} alt={`Photo ${modalIndex + 1}`} className="max-h-full max-w-full object-contain" />
                </div>
              ) : null;
            })()
          )}
        </Modal>
      )}
    </div>  
  </div>
  );
}
