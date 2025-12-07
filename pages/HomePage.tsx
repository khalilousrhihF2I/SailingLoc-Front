
import { HeroSection } from '../components/home/HeroSection';
import { BoatCard } from '../components/boats/BoatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Anchor, Shield, ThumbsUp, Award, Star } from 'lucide-react';
import { destinationService, boatService } from '../services/ServiceFactory';
import { useEffect, useState } from 'react';
import { homeService } from '../services/ServiceFactory';
import type { HomeResponse } from '../services/interfaces/IHomeService';
import { useModal } from '../hooks/useModal';
import { Page } from '../types/navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: Page, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { showConfirm } = useModal();
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [popularDestinations, setPopularDestinations] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        console.log(loading);
        setLoading(true);
        const data = await homeService.getHome();
        if (mounted) setHomeData(data);
        try {
          const dests = await destinationService.getPopularDestinations(4);
          if (mounted) setPopularDestinations(dests);
        } catch (err) {
          console.warn('Failed to load popular destinations', err);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // Show welcome modal once per user (localStorage)
    try {
      const seen = localStorage.getItem('sailingloc_seen_welcome');
      if (!seen) {
        showConfirm({
          title: 'Bienvenue sur SailingLoc',
          single: true,
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src="https://www.institut-f2i.fr/wp-content/themes/f2i-theme/img/logo-F2I.svg" alt="F2I" className="h-14" />
                <div>
                  <h3 className="text-lg font-semibold">Projet de fin d'études</h3>
                  <a href="https://www.institut-f2i.fr/" target="_blank" rel="noreferrer" className="text-ocean-600 underline">Institut F2I</a>
                </div>
              </div>

              <p className="text-gray-700">
                Bienvenue ! Cette application a été développée dans le cadre du projet de fin d'études
                de la 4ème année de <strong>Khalil Ousrihr</strong> pour l'évaluation de son école <em>F2I</em>.
              </p>

              <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
                <strong>Important :</strong>
                <p className="mt-2 text-sm text-gray-700">Les réservations effectuées via cette application ne constituent pas de réservations réelles. L'objectif est pédagogique — merci de ne pas effectuer de paiements ni d'attendre une confirmation réelle.</p>
              </div>

              <p className="text-sm text-gray-600">Vous pouvez fermer ce message pour commencer à explorer l'application.</p>
            </div>
          ),
          confirmLabel: "J'ai compris",
        });

        localStorage.setItem('sailingloc_seen_welcome', '1');
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return () => { mounted = false; };
  }, []);
  const handleSearch = (params: any) => {
    onNavigate('search', params);
  };

  return (
    <div className="min-h-screen">
      <HeroSection onSearch={handleSearch} />
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Explorez nos catégories</h2>
            <p className="text-gray-600 text-lg">Trouvez le bateau parfait pour votre aventure</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(homeData?.topBoatTypes ?? [
              { id: 'sailboat', name: 'Voiliers', count: 0 },
              { id: 'catamaran', name: 'Catamarans', count: 0 },
              { id: 'motor', name: 'Bateaux à moteur', count: 0 },
              { id: 'semirigid', name: 'Semi-rigides', count: 0 }
            ]).map((category, idx) => {
              const typeKey = (category as any).type ?? (category as any).id ?? `cat-${idx}`;
              const label = (category as any).name ?? ((boatService as any).constructor?.boatTypes?.find((t: any) => t.value === typeKey)?.label) ?? String(typeKey);

              return (
                <Card
                  key={typeKey}
                  hover
                  className="p-6 text-center cursor-pointer"
                  onClick={() => onNavigate('search', { type: typeKey })}
                >
                  <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Anchor className="text-ocean-600" size={32} />
                  </div>
                  <h4 className="text-gray-900 mb-2">{label}</h4>
                  <p className="text-gray-600">{(category as any).count} bateaux</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Boats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-gray-900 mb-2">Bateaux populaires</h2>
              <p className="text-gray-600">Les mieux notés par notre communauté</p>
            </div>
            <Button variant="ghost" onClick={() => onNavigate('search')}>
              Voir tout
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(homeData?.popularBoats ?? []).slice(0, 6).map((b, idx) => {
              // Normalize to the shape expected by BoatCard
              const normalized = {
                id: b.id,
                name: b.name,
                type: (b as any).type || 'sailboat',
                location: (b as any).location || (b as any).destination || (b as any).city || 'Unknown',
                price: (b as any).price ?? (b as any).pricePerDay ?? 0,
                capacity: (b as any).capacity ?? 4,
                image: (b as any).image || (b as any).imageUrl || '',
                rating: (b as any).rating ?? 4.5,
                reviews: (b as any).reviewCount ?? (b as any).reviews ?? 0,
              } as any;

              return (
                <BoatCard
                  key={normalized.id ?? `boat-${idx}`}
                  boat={normalized}
                  onClick={() => onNavigate('boat-detail', { boatId: normalized.id })}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Destinations populaires</h2>
            <p className="text-gray-600 text-lg">Découvrez les plus belles régions nautiques</p>
          </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(popularDestinations ?? homeData?.popularDestinations ?? []).map((destination, idx) => (
              <Card 
                key={destination.id ?? `dest-${idx}`} 
                hover 
                className="overflow-hidden cursor-pointer"
                onClick={() => onNavigate('search', { destination: destination.name })}
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="text-white mb-1">{destination.name}</h4>
                    <p className="text-sm text-gray-200">{destination.boatCount} bateaux disponibles</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why SailingLoc */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Pourquoi choisir SailingLoc ?</h2>
            <p className="text-gray-600 text-lg">La plateforme de confiance pour louer un bateau</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Paiement sécurisé',
                description: 'Transactions 100% sécurisées et protection contre les fraudes'
              },
              {
                icon: Award,
                title: 'Bateaux vérifiés',
                description: 'Tous nos bateaux sont inspectés et certifiés conformes'
              },
              {
                icon: ThumbsUp,
                title: 'Assurance incluse',
                description: 'Couverture complète pour votre tranquillité d\'esprit'
              },
              {
                icon: Star,
                title: 'Support 24/7',
                description: 'Notre équipe est là pour vous aider à tout moment'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-turquoise-600" size={32} />
                </div>
                <h4 className="text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ocean-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4">Propriétaire de bateau ?</h2>
          <p className="text-xl text-ocean-100 mb-8">
            Gagnez jusqu'à 20 000€ par an en louant votre bateau sur SailingLoc
          </p>
          <Button 
            variant="secondary"  className='mt-3'
            size="lg" 
            onClick={() => onNavigate('register')}
          >
            Proposer mon bateau
          </Button>
        </div>
      </section>
    </div>
  );
}
