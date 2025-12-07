import  { useState, useEffect } from 'react';
import type { Destination } from '../services/interfaces/IDestinationService';
import { Search, MapPin, Anchor, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { destinationService } from '../services/ServiceFactory';
import { Page } from '../types/navigation';

interface DestinationsPageProps {
  onNavigate: (page: Page, data?: any) => void;
}

// removed static placeholder; destinations come from API

export function DestinationsPage({ onNavigate }: DestinationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [allDestinationsState, setAllDestinationsState] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const regions = ['all', 'France', 'Méditerranée', 'Atlantique', 'Caraïbes'];

  const filteredDestinations = allDestinationsState.filter((dest: Destination) => {
    const matchesSearch = (dest.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (dest.region ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || dest.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // helper to handle API returning arrays or JSON-encoded strings
  const parseArrayField = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        // not JSON — try comma split
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await destinationService.getAllDestinations();
        if (mounted) setAllDestinationsState(data || []);
      } catch (err) {
        console.error('Failed to load destinations', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-ocean-900 text-white py-20">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1733272967076-3a2ce81226e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwY29hc3QlMjBzYWlsaW5nfGVufDF8fHx8MTc2NDI1NTMzNXww&ixlib=rb-4.1.0&q=80&w=1080)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-white mb-4">Destinations de rêve</h1>
            <p className="text-white-600 mb-8">
              Explorez les plus belles destinations nautiques et trouvez le bateau parfait pour votre prochaine aventure
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher une destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={20} />}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {regions.map(region => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setSelectedRegion(region)}
                >
                  {region === 'all' ? 'Toutes' : region}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl text-ocean-600 mb-2">
                {allDestinationsState.length}+
              </div>
              <div className="text-gray-600">Destinations</div>
            </div>
            <div>
              <div className="text-3xl text-ocean-600 mb-2">
                {allDestinationsState.reduce((sum, d) => sum + (d.boatCount ?? (Array.isArray((d as any).boats) ? (d as any).boats.length : ((d as any).boats ?? 0))), 0)}+
              </div>
              <div className="text-gray-600">Bateaux disponibles</div>
            </div>
            <div>
              <div className="text-3xl text-ocean-600 mb-2">50+</div>
              <div className="text-gray-600">Ports partenaires</div>
            </div>
            <div>
              <div className="text-3xl text-ocean-600 mb-2">4.8</div>
              <div className="text-gray-600">Note moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-gray-900 mb-2">
                {filteredDestinations.length} destination{filteredDestinations.length > 1 ? 's' : ''}
              </h2>
              <p className="text-gray-600">Trouvez votre prochaine destination de navigation</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">Chargement des destinations...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination: Destination) => {
                const months = parseArrayField(destination.popularMonths);
                const highlights = parseArrayField(destination.highlights);
                const boatsCount = destination.boatCount ?? (Array.isArray((destination as any).boats) ? (destination as any).boats.length : ((destination as any).boats ?? 0));

                return (
                  <Card key={destination.id} hover className="overflow-hidden cursor-pointer group">
                    <div className="relative h-64">
                      <ImageWithFallback
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="success">
                          <TrendingUp size={14} className='mr-2' />
                          Populaire
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={18} />
                          <span className="text-sm text-gray-200">{destination.region ?? destination.country ?? ''}</span>
                        </div>
                        <h3 className="text-white mb-1">{destination.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-200">
                          <div className="flex items-center gap-1">
                            <Anchor size={16} />
                            <span>{boatsCount} bateaux</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>dès {destination.averagePrice ?? '-'}€/jour</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{destination.description}</p>

                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">Meilleure période :</div>
                        <div className="flex gap-2 flex-wrap">
                          {months.map((month: string, idx: number) => (
                            <Badge key={`${destination.id}-month-${idx}`} variant="default">{month}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4 height-bc">
                        <div className="text-sm text-gray-500 mb-2">À découvrir :</div>
                        <div className="flex gap-2 flex-wrap">
                          {highlights.slice(0, 3).map((highlight: string, idx: number) => (
                            <Badge key={`${destination.id}-hl-${idx}`} variant="default">{highlight}</Badge>
                          ))}
                          {highlights.length > 3 && (
                            <Badge variant="default">+{highlights.length - 3}</Badge>
                          )}
                        </div>
                      </div>

                      <Button variant="primary" fullWidth onClick={() => onNavigate('search', { destination: destination.name })}>
                        <Search size={18} />
                        Voir les bateaux
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ocean-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Anchor className="mx-auto mb-6 text-ocean-100" size={48} />
          <h2 className="text-white mb-4">Vous ne trouvez pas votre destination ?</h2>
          <p className="text-xl text-ocean-100 mb-8">
            Contactez-nous et nous vous aiderons à trouver le bateau parfait pour votre prochaine aventure
          </p>
          <div className="flex gap-4 justify-center flex-wrap mt-3">
            <Button 
              variant="ghost" 
              size="lg" className="bg-white text-ocean-600 hover:bg-ocean-50"
              onClick={() => onNavigate('contact')}
            >
              Nous contacter
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => onNavigate('search')}
              className="bg-white text-ocean-600 hover:bg-ocean-50"
            >
              Voir tous les bateaux
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
