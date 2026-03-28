import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, CalendarCheck, Ship, CreditCard, Shield, Star, Users, Anchor } from 'lucide-react';
import { Page } from '../types/navigation';

interface HowItWorksPageProps {
  onNavigate: (page: Page) => void;
}

export function HowItWorksPage({ onNavigate }: HowItWorksPageProps) {
  const renterSteps = [
    {
      icon: Search,
      title: 'Recherchez',
      description: 'Parcourez notre catalogue de bateaux, filtrez par type, destination, prix et dates pour trouver le bateau idéal.',
    },
    {
      icon: CalendarCheck,
      title: 'Réservez',
      description: 'Sélectionnez vos dates, vérifiez la disponibilité et réservez en quelques clics. Paiement sécurisé par Stripe.',
    },
    {
      icon: Ship,
      title: 'Naviguez',
      description: 'Retrouvez le propriétaire au port, prenez possession du bateau et profitez de votre aventure en mer.',
    },
    {
      icon: Star,
      title: 'Évaluez',
      description: 'Après votre sortie, laissez un avis pour aider la communauté et partagez votre expérience.',
    },
  ];

  const ownerSteps = [
    {
      icon: Anchor,
      title: 'Créez votre annonce',
      description: 'Inscrivez-vous en tant que propriétaire et publiez votre bateau avec photos, équipements et tarifs.',
    },
    {
      icon: Shield,
      title: 'Vérification',
      description: 'Notre équipe vérifie votre annonce et vos documents pour garantir la sécurité de tous les utilisateurs.',
    },
    {
      icon: Users,
      title: 'Recevez des demandes',
      description: 'Les locataires réservent directement. Vous gérez vos disponibilités et confirmez les réservations.',
    },
    {
      icon: CreditCard,
      title: 'Recevez vos paiements',
      description: 'Les paiements sont versés automatiquement après chaque location. Suivez vos revenus depuis votre tableau de bord.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl mb-6">Comment ça marche ?</h1>
          <p className="text-lg md:text-xl text-ocean-100 max-w-2xl mx-auto">
            Louer un bateau ou proposer le vôtre sur SailingLoc est simple, rapide et sécurisé.
          </p>
        </div>
      </div>

      {/* Renter Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Pour les locataires</h2>
            <p className="text-gray-600 text-lg">Trouvez et réservez votre bateau en 4 étapes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {renterSteps.map((step, index) => (
              <Card key={index} className="p-8 text-center relative hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-100 rounded-full mb-6 mt-2">
                  <step.icon className="text-ocean-600" size={32} />
                </div>
                <h3 className="text-gray-900 mb-3 font-semibold">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Pour les propriétaires</h2>
            <p className="text-gray-600 text-lg">Rentabilisez votre bateau en 4 étapes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ownerSteps.map((step, index) => (
              <Card key={index} className="p-8 text-center relative hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-turquoise-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-turquoise-100 rounded-full mb-6 mt-2">
                  <step.icon className="text-turquoise-600" size={32} />
                </div>
                <h3 className="text-gray-900 mb-3 font-semibold">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 bg-gradient-to-br from-ocean-50 to-turquoise-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Shield className="text-green-600" size={32} />
          </div>
          <h2 className="text-gray-900 mb-4">Sécurité et confiance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
            <Card className="p-6">
              <h4 className="text-gray-900 font-semibold mb-2">Paiement sécurisé</h4>
              <p className="text-gray-600 text-sm">Toutes les transactions passent par Stripe, leader mondial du paiement en ligne.</p>
            </Card>
            <Card className="p-6">
              <h4 className="text-gray-900 font-semibold mb-2">Annonces vérifiées</h4>
              <p className="text-gray-600 text-sm">Chaque bateau est vérifié par notre équipe avant publication sur la plateforme.</p>
            </Card>
            <Card className="p-6">
              <h4 className="text-gray-900 font-semibold mb-2">Assurance incluse</h4>
              <p className="text-gray-600 text-sm">Une couverture complète est incluse dans chaque réservation pour votre tranquillité.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 bg-gradient-to-br from-ocean-600 to-ocean-800 text-white text-center">
            <h2 className="text-white mb-6">Prêt à embarquer ?</h2>
            <p className="text-ocean-100 mb-8">
              Rejoignez des milliers de passionnés de la mer sur SailingLoc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="ghost"
                onClick={() => onNavigate('search')}
                className="bg-white text-ocean-600 hover:bg-gray-100"
              >
                Rechercher un bateau
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('register')}
                className="bg-orange-500 text-white hover:bg-orange-600 border-none"
              >
                Devenir propriétaire
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
