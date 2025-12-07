import  { useState, useEffect } from 'react';
import { MapPin, Users, Anchor, Calendar, Star, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { boatService } from '../services/ServiceFactory';
import type { Boat } from '../services/interfaces/IBoatService';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Page } from '../types/navigation';
import { availabilityService } from '../services/ServiceFactory';
import { UnavailablePeriod } from '../services/interfaces/IAvailabilityService';
import { validateBookingDates, calculateDays } from '../utils/dateValidation';

interface BoatDetailPageProps {
  boatId: number;
  onNavigate: (page: Page, data?: any) => void;
}

export function BoatDetailPageWithAvailability({ boatId, onNavigate }: BoatDetailPageProps) {
  const [boat, setBoat] = useState<Boat | null>(null);
  const [boatReviews, setBoatReviews] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [canBook, setCanBook] = useState(false);
  const [loadingBoat, setLoadingBoat] = useState(true);

  // Charger les disponibilités au montage
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const periods = await availabilityService.getUnavailableDates(boatId);
        setUnavailablePeriods(periods);
      } catch (error) {
        console.error('Error loading availability:', error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [boatId]);

  useEffect(() => {
    let mounted = true;
    const loadBoat = async () => {
      setLoadingBoat(true);
      try {
        const b = await boatService.getBoatById(boatId);
        if (!mounted) return;
        setBoat(b || null);
        // try to fetch reviews from boatService if available
        if (b && (boatService as any).getReviews) {
          try {
            const r = await (boatService as any).getReviews(boatId);
            if (mounted) setBoatReviews(r || []);
          } catch { if (mounted) setBoatReviews([]); }
        }
      } catch (err) {
        console.error('Error loading boat:', err);
      } finally {
        if (mounted) setLoadingBoat(false);
      }
    };
    loadBoat();
    return () => { mounted = false; };
  }, [boatId]);

  // Vérifier la disponibilité quand les dates changent
  useEffect(() => {
    const checkAvailability = async () => {
      if (!startDate || !endDate) {
        setCanBook(false);
        return;
      }

      // Valider les dates d'abord
      const validation = validateBookingDates(startDate, endDate);
      if (!validation.isValid) {
        setCanBook(false);
        return;
      }

      try {
        const result = await availabilityService.checkAvailability(boatId, startDate, endDate);
        setCanBook(result.isAvailable);
      } catch (error) {
        console.error('Error checking availability:', error);
        setCanBook(false);
      }
    };

    checkAvailability();
  }, [boatId, startDate, endDate]);

  if (loadingBoat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement du bateau...</p>
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

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const subtotal = days * boat.price;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const typeLabels: Record<string, string> = {
    sailboat: 'Voilier',
    catamaran: 'Catamaran',
    motor: 'Moteur',
    semirigid: 'Semi-rigide'
  };

  const handleBooking = () => {
    if (!canBook || !startDate || !endDate) return;

    onNavigate('booking-step1', {
      boatId: boat.id,
      startDate,
      endDate,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 h-96 rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={boat.image}
                alt={boat.name}
                className="w-full h-full object-cover"
              />
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
                      <span>{boat.location}</span>
                    </div>
                    <Badge variant="info">{typeLabels[boat.type]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-current" />
                  <span className="text-gray-900">{boat.rating}</span>
                  <span className="text-gray-500">({boat.reviews} avis)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={20} />
                  <span>{boat.capacity} personnes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Anchor size={20} />
                  <span>{boat.length}m</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={20} />
                  <span>{boat.year}</span>
                </div>
              </div>

              <p className="text-gray-700">{boat.description}</p>
            </Card>

            {/* Equipment */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Équipements</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(boat.equipment) ? (
                  boat.equipment.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle size={18} className="text-ocean-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : typeof boat.equipment === 'string' && boat.equipment ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={18} className="text-ocean-600 shrink-0" />
                    <span>{boat.equipment}</span>
                  </div>
                ) : (
                  <div className="text-gray-500">Aucun équipement listé</div>
                )}
              </div>
            </Card>

            {/* Owner */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Propriétaire</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-ocean-600 text-white rounded-full flex items-center justify-center text-xl">
                  {boat.ownerAvatar}
                </div>
                <div>
                  <p className="text-gray-900">{boat.ownerName}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Shield size={16} className="text-green-600" />
                    <span>Vérifié</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star size={24} className="text-yellow-500 fill-current" />
                <h3 className="text-gray-900">{boat.rating} · {boat.reviews} avis</h3>
              </div>

              <div className="space-y-4">
                {boatReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.userAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-gray-900">{review.userName}</p>
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500 fill-current" />
                            <span className="text-sm">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl text-gray-900">{boat.price}€</span>
                <span className="text-gray-600">/jour</span>
              </div>

              <div className="mb-6">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  unavailablePeriods={unavailablePeriods}
                  disabled={loadingAvailability}
                  showValidation={true}
                />
              </div>

              {days > 0 && (
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{boat.price}€ × {days} jours</span>
                    <span className="text-gray-900">{subtotal}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de service</span>
                    <span className="text-gray-900">{serviceFee.toFixed(2)}€</span>
                  </div>
                </div>
              )}

              {days > 0 && (
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-900">Total</span>
                  <span className="text-2xl text-ocean-600">{total.toFixed(2)}€</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleBooking}
                disabled={!canBook || days === 0 || loadingAvailability}
              >
                {loadingAvailability
                  ? 'Chargement...'
                  : !startDate || !endDate
                  ? 'Sélectionnez des dates'
                  : !canBook
                  ? 'Dates indisponibles'
                  : 'Réserver'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Vous ne serez pas débité maintenant
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
