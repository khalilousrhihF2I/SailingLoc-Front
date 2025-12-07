import  { useState } from 'react';
import { SlidersHorizontal, MapPin, X } from 'lucide-react';
import { BoatCard } from '../components/boats/BoatCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { boatService, destinationService } from '../services/ServiceFactory';
import { useEffect } from 'react';
import { Page } from '../types/navigation';

interface SearchPageProps {
  onNavigate: (page: Page, data?: any) => void;
  initialFilters?: any;
}

export function SearchPage({ onNavigate, initialFilters = {} }: SearchPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    destination: initialFilters.destination || '',
    type: initialFilters.type || 'all',
    priceMin: '',
    priceMax: '',
    capacityMin: '',
    equipment: [] as string[]
  });

  const [boats, setBoats] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [boatTypesState, setBoatTypesState] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      boatService.getBoats(),
      destinationService.getAllDestinations()
    ])
      .then(([boatsResp, destResp]: any) => {
        if (!mounted) return;
        const boatsArray = Array.isArray(boatsResp) ? boatsResp : [];
        const destArray = Array.isArray(destResp) ? destResp : [];

        const normalizeBoat = (b: any) => {
          // equipment may come as a JSON-encoded string from the API
          let equipment: string[] = [];
          try {
            if (typeof b.equipment === 'string') {
              equipment = JSON.parse(b.equipment);
            } else if (Array.isArray(b.equipment)) {
              equipment = b.equipment;
            }
          } catch (e) {
            // fallback: comma-separated
            equipment = String(b.equipment || '').split(',').map((s: string) => s.trim()).filter(Boolean);
          }

          const reviewsCount = (() => {
            if (typeof b.reviewCount === 'number') return b.reviewCount;
            if (Array.isArray(b.reviews)) return b.reviews.length;
            return 0;
          })();

          return {
            ...b,
            equipment,
            reviews: reviewsCount,
            image: b.image || (b.images && b.images[0]?.imageUrl) || '',
            location: b.location || b.city || '',
            price: typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0
          };
        };

        const normalized = boatsArray.map(normalizeBoat);
        setBoats(normalized);
        setDestinations(destArray);
        // derive types from boats if none provided by API
        const TYPE_LABELS: Record<string, string> = {
          sailboat: 'Voiliers',
          catamaran: 'Catamarans',
          motor: 'Bateaux à moteur',
          semirigid: 'Semi-rigides'
        };

        const derivedTypes = Array.from(new Set(normalized.map(b => b.type).filter(Boolean)));
        const types = [
          { value: 'all', label: 'Tous' },
          ...derivedTypes.map((t: any) => ({ value: t, label: TYPE_LABELS[t] || String(t).charAt(0).toUpperCase() + String(t).slice(1) }))
        ];
        setBoatTypesState(types);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Erreur lors du chargement');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredBoats = boats.filter(boat => {
    if (filters.location && !boat.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.destination) {
      // Try to resolve the destination filter to a destination id using the destinations list
      const maybeId = parseInt(String(filters.destination));
      let destId: number | null = null;
      if (!isNaN(maybeId)) {
        destId = maybeId;
      } else {
        const match = destinations.find((d: any) =>
          (d.name && d.name.toLowerCase().includes(filters.destination.toLowerCase())) ||
          (d.region && d.region.toLowerCase().includes(filters.destination.toLowerCase()))
        );
        if (match) destId = match.id;
      }

      if (destId === null) return false;
      if (boat.destinationId !== destId) return false;
    }
    if (filters.type !== 'all' && boat.type !== filters.type) {
      return false;
    }
    if (filters.priceMin && boat.price < parseInt(filters.priceMin)) {
      return false;
    }
    if (filters.priceMax && boat.price > parseInt(filters.priceMax)) {
      return false;
    }
    if (filters.capacityMin && boat.capacity < parseInt(filters.capacityMin)) {
      return false;
    }
    // equipment filter: require all selected equipments to be present on the boat
    if (filters.equipment && filters.equipment.length > 0) {
      const hasAll = filters.equipment.every((eq: string) => (boat.equipment || []).map((x: string) => x.toLowerCase()).includes(eq.toLowerCase()));
      if (!hasAll) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-2">Résultats de recherche</h2>
          <p className="text-gray-600">{filteredBoats.length} bateaux disponibles</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="text-gray-900 mb-6">Filtres</h3>
              
              <div className="space-y-6">
                <Input
                  label="Destination"
                  placeholder="Ex: Côte d'Azur, Grèce..."
                  value={filters.destination}
                  onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                  icon={<MapPin size={20} />}
                />

                <Input
                  label="Ville ou port"
                  placeholder="Ex: Nice, Cannes..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  icon={<MapPin size={20} />}
                />
                
                <Select
                  label="Type de bateau"
                  options={boatTypesState}
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                />
                
                <div>
                  <label className="block mb-2 text-gray-700">Prix par jour</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                    />
                  </div>
                </div>
                
                <Input
                  label="Capacité minimale"
                  type="number"
                  placeholder="Nombre de personnes"
                  value={filters.capacityMin}
                  onChange={(e) => setFilters({ ...filters, capacityMin: e.target.value })}
                />
                
                <div>
                  <label className="block mb-2 text-gray-700">Équipements</label>
                  <div className="space-y-2">
                    {['GPS', 'Pilote automatique', 'Annexe', 'WiFi', 'Climatisation'].map((eq) => (
                      <label key={eq} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filters.equipment.includes(eq)}
                          onChange={(e) => {
                            const next = e.target.checked ? [...filters.equipment, eq] : filters.equipment.filter(x => x !== eq);
                            setFilters({ ...filters, equipment: next });
                          }}
                          className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                        />
                        <span className="text-sm text-gray-700">{eq}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setFilters({
                    location: '',
                    destination: '',
                    type: 'all',
                    priceMin: '',
                    priceMax: '',
                    capacityMin: '',
                    equipment: []
                  })}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} />
              Filtres
            </Button>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Active Filters */}
            {(filters.location || filters.destination || filters.type !== 'all' || filters.priceMin || filters.priceMax) && (
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Filtres actifs:</span>
                  {filters.destination && (
                    <Badge variant="info">
                      {filters.destination}
                      <button 
                        onClick={() => setFilters({ ...filters, destination: '' })}
                        className="ml-2"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="info">
                      {filters.location}
                      <button 
                        onClick={() => setFilters({ ...filters, location: '' })}
                        className="ml-2"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  )}
                  {filters.type !== 'all' && (
                    <Badge variant="info">
                      {boatTypesState.find((t: any) => t.value === filters.type)?.label}
                      <button 
                        onClick={() => setFilters({ ...filters, type: 'all' })}
                        className="ml-2"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Boats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading && (
                <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-6 text-center shadow-sm">Chargement des bateaux...</div>
              )}
              {!loading && error && (
                <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-6 text-center shadow-sm text-red-600">Erreur: {error}</div>
              )}
              {!loading && !error && filteredBoats.map((boat) => (
                <BoatCard
                  key={boat.id}
                  boat={boat}
                  onClick={() => onNavigate('boat-detail', { boatId: boat.id })}
                />
              ))}
            </div>

            {filteredBoats.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <p className="text-gray-600 mb-4">Aucun bateau ne correspond à vos critères</p>
                <Button 
                  variant="ghost"
                  onClick={() => setFilters({
                    location: '',
                    destination: '',
                    type: 'all',
                    priceMin: '',
                    priceMax: '',
                    capacityMin: '',
                    equipment: []
                  })}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
