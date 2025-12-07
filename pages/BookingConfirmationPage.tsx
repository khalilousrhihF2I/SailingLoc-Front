
import { Check, Calendar, MapPin, Anchor, Mail, Download, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Page } from '../types/navigation';

interface BookingConfirmationPageProps {
  bookingData: {
    bookingId: string;
    boat: any;
    startDate: string;
    endDate: string;
    totalPrice: number;
    serviceFee: number;
    renterEmail: string;
    renterName: string;
  };
  onNavigate: (page: Page, data?: any) => void;
}

export function BookingConfirmationPage({ bookingData, onNavigate }: BookingConfirmationPageProps) {
  const { bookingId, boat, startDate, endDate, totalPrice, serviceFee, renterEmail } = bookingData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={48} />
          </div>
          <h1 className="text-gray-900 mb-2">Réservation confirmée !</h1>
          <p className="text-xl text-gray-600">
            Votre location a été confirmée avec succès
          </p>
        </div>

        {/* Booking ID */}
        <Card className="p-6 mb-6 bg-ocean-50 border-ocean-200">
          <div className="text-center">
            <div className="text-sm text-ocean-700 mb-2">Numéro de réservation</div>
            <div className="text-2xl text-ocean-900 font-mono">{bookingId}</div>
          </div>
        </Card>

        {/* Confirmation Email Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Mail className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <div className="mb-1">Un email de confirmation a été envoyé à <strong>{renterEmail}</strong></div>
            <div className="text-xs text-blue-700">
              Vous y trouverez tous les détails de votre réservation et les coordonnées du propriétaire.
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-gray-900 mb-6">Détails de votre location</h2>

          {/* Boat Info */}
          <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0">
              <ImageWithFallback
                src={boat.image}
                alt={boat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">{boat.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={16} />
                <span>{boat.location}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Anchor size={16} />
                  <span>{boat.length}m</span>
                </div>
                <div>•</div>
                <div>{boat.capacity} pers.</div>
                <div>•</div>
                <div>{boat.cabins} cabines</div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-2">Date de départ</div>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-ocean-600" />
                <span className="text-gray-900">{formatDate(startDate)}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1 ml-7">à partir de 14h00</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Date de retour</div>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-ocean-600" />
                <span className="text-gray-900">{formatDate(endDate)}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1 ml-7">avant 10h00</div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-700">
              <span>{boat.price}€ × {days} jours</span>
              <span>{boat.price * days}€</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span>Frais de service SailingLoc</span>
              <span>{serviceFee}€</span>
            </div>
            <div className="flex items-center justify-between text-gray-700 pb-3 border-b border-gray-200">
              <span>Assurance protection</span>
              <span>Incluse</span>
            </div>
            <div className="flex items-center justify-between text-xl text-gray-900">
              <span>Total payé</span>
              <span>{totalPrice.toFixed(2)}€</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6">
          <h3 className="text-gray-900 mb-4">Prochaines étapes</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center shrink-0 text-sm text-ocean-700">
                1
              </div>
              <div>
                <div className="text-gray-900 mb-1">Le propriétaire vous contactera</div>
                <div className="text-sm text-gray-600">
                  Vous recevrez les informations pratiques et les instructions pour l'embarquement sous 24h
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center shrink-0 text-sm text-ocean-700">
                2
              </div>
              <div>
                <div className="text-gray-900 mb-1">Préparez vos documents</div>
                <div className="text-sm text-gray-600">
                  Permis bateau (si requis), pièce d'identité et confirmation de réservation
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center shrink-0 text-sm text-ocean-700">
                3
              </div>
              <div>
                <div className="text-gray-900 mb-1">État des lieux</div>
                <div className="text-sm text-gray-600">
                  Un état des lieux sera effectué au départ et au retour du bateau
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Support Info */}
        <Card className="p-6 mb-8 bg-gray-50">
          <h3 className="text-gray-900 mb-3">Besoin d'aide ?</h3>
          <p className="text-gray-600 mb-4">
            Notre équipe est disponible 24/7 pour répondre à toutes vos questions
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('contact')}>
              Nous contacter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('faq')}>
              Consulter la FAQ
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              window.print();
            }}
          >
            <Download size={18} />
            Télécharger la confirmation
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onNavigate('renter-dashboard')}
          >
            Voir mes réservations
            <ArrowRight size={18} />
          </Button>
        </div>

        {/* Share Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Partagez votre expérience SailingLoc avec vos amis !
          </p>
          <div className="flex justify-center gap-3">
            <Badge variant="default">
              Partager
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
