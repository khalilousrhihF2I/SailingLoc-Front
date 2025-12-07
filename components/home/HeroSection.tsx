import  { useState } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { boatService } from '../../services/ServiceFactory';

interface HeroSectionProps {
  onSearch: (params: { location: string; startDate: string; endDate: string; type: string }) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('all');
  const boatTypes = (boatService as any).constructor?.boatTypes ?? [];
  const loadingTypes = false;

  const handleSearch = () => {
    onSearch({ location, startDate, endDate, type });
  };

  // boatTypes are static in ApiBoatService; no async load required

  return (
    <div className="relative bg-ocean-900 text-white overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1705094655478-1e41c6736104?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWlsaW5nJTIweWFjaHQlMjBvY2VhbnxlbnwxfHx8fDE3NjQyMDgxMzB8MA&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-white mb-4 px-4">
            Louez le bateau de vos rêves
          </h1>
          <p className="text-lg md:text-xl text-ocean-100 px-4">
            Découvrez notre sélection de bateaux entre particuliers pour des moments inoubliables en mer
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block mb-2 text-sm text-gray-700">Localisation</label>
              <Input
                type="text"
                placeholder="Ville ou port"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                icon={<MapPin size={20} />}
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block mb-2 text-sm text-gray-700">Début de location</label>
              <Input
                type="date"
                placeholder="Date de début"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={<Calendar size={20} />}
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block mb-2 text-sm text-gray-700">Fin de location</label>
              <Input
                type="date"
                placeholder="Date de fin"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={<Calendar size={20} />}
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block mb-2 text-sm text-gray-700">Type de bateau</label>
              {loadingTypes ? (
                <div className="text-sm text-gray-500">Chargement...</div>
              ) : (
                <Select
                  options={boatTypes}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              )}
            </div>
            
            <div className="lg:col-span-1">
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                onClick={handleSearch}
                className="mt-6 lg:mt-0"
              >
                <Search size={20} />
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
