
import { Ship, DollarSign, Users, Anchor, Calendar, Image as ImageIcon, MapPin, Package, CheckCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useEffect, useState } from 'react';
import { homeService, boatService } from '../../services/ServiceFactory';

interface BasicInfo {
  name: string;
  type: string;
  year: number;
  length: string;
  capacity: string;
  cabins: string;
}

interface Location {
  city: string;
  location: string;
  country: string;
  destination: string;
}

interface Details {
  price: string;
  description: string;
  image: string;
}

interface BoatFormStep1Props {
  basicInfo: BasicInfo;
  onChange: (info: BasicInfo) => void;
}

export function BoatFormStep1({ basicInfo, onChange }: BoatFormStep1Props) {
  const [types, setTypes] = useState<{ value: string; label: string }[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingTypes(true);
    homeService.getTopBoatTypes().then((res: any) => {
      if (!mounted) return;
      setTypes((res || []).map((t: any) => ({ value: t.id, label: t.name })));
    }).catch(() => {
      if (!mounted) return;
      setTypes([]);
    }).finally(() => mounted && setLoadingTypes(false));
    return () => { mounted = false; };
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <Ship className="text-ocean-600 mb-2" size={32} />
        <h3 className="text-gray-900 mb-2">Informations de base</h3>
        <p className="text-gray-600">Décrivez les caractéristiques principales de votre bateau</p>
      </div>

      <Input
        label="Nom du bateau *"
        placeholder="Ex: Ocean Spirit, Blue Dream..."
        value={basicInfo.name}
        onChange={(e) => onChange({ ...basicInfo, name: e.target.value })}
        icon={<Ship size={20} />}
        required
      />

      {loadingTypes ? (
        <div className="text-sm text-gray-500">Chargement...</div>
      ) : (
        <Select
          label="Type de bateau *"
          options={types}
          value={basicInfo.type}
          onChange={(e) => onChange({ ...basicInfo, type: e.target.value })}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="number"
          label="Année *"
          placeholder="2020"
          value={basicInfo.year}
          onChange={(e) => onChange({ ...basicInfo, year: parseInt(e.target.value) })}
          icon={<Calendar size={20} />}
          required
        />

        <Input
          type="number"
          label="Longueur (m) *"
          placeholder="12.5"
          step="0.1"
          value={basicInfo.length}
          onChange={(e) => onChange({ ...basicInfo, length: e.target.value })}
          icon={<Anchor size={20} />}
          required
        />

        <Input
          type="number"
          label="Capacité *"
          placeholder="8"
          value={basicInfo.capacity}
          onChange={(e) => onChange({ ...basicInfo, capacity: e.target.value })}
          icon={<Users size={20} />}
          required
        />
      </div>

      <Input
        type="number"
        label="Nombre de cabines"
        placeholder="3"
        value={basicInfo.cabins}
        onChange={(e) => onChange({ ...basicInfo, cabins: e.target.value })}
      />
    </div>
  );
}

interface BoatFormStep2Props {
  location: Location;
  onChange: (location: Location) => void;
}

export function BoatFormStep2({ location, onChange }: BoatFormStep2Props) {
  return (
    <div className="space-y-6">
      <div>
        <MapPin className="text-ocean-600 mb-2" size={32} />
        <h3 className="text-gray-900 mb-2">Où se trouve votre bateau ?</h3>
        <p className="text-gray-600">Indiquez la localisation précise pour que les locataires puissent vous trouver</p>
      </div>

      <Input
        label="Ville / Port *"
        placeholder="Ex: Nice, Cannes, Ajaccio..."
        value={location.city}
        onChange={(e) => onChange({ ...location, city: e.target.value })}
        required
      />

      <Input
        label="Localisation précise *"
        placeholder="Ex: Port de Nice, Marina Baie des Anges..."
        value={location.location}
        onChange={(e) => onChange({ ...location, location: e.target.value })}
        required
      />

      <Input
        label="Pays *"
        placeholder="Ex: France, Grèce, Italie..."
        value={location.country}
        onChange={(e) => onChange({ ...location, country: e.target.value })}
        required
      />

      <Input
        label="Destination / Région"
        placeholder="Ex: Côte d'Azur, Grèce, Corse..."
        value={location.destination}
        onChange={(e) => onChange({ ...location, destination: e.target.value })}
      />
    </div>
  );
}

interface BoatFormStep3Props {
  details: Details;
  onChange: (details: Details) => void;
}

export function BoatFormStep3({ details, onChange }: BoatFormStep3Props) {
  return (
    <div className="space-y-6">
      <div>
        <DollarSign className="text-ocean-600 mb-2" size={32} />
        <h3 className="text-gray-900 mb-2">Prix et description</h3>
        <p className="text-gray-600">Définissez votre tarif et décrivez votre bateau de manière attractive</p>
      </div>

      <Input
        type="number"
        label="Prix par jour (€) *"
        placeholder="350"
        value={details.price}
        onChange={(e) => onChange({ ...details, price: e.target.value })}
        icon={<DollarSign size={20} />}
        required
      />

      <div>
        <label className="block mb-2 text-gray-700">Description *</label>
        <textarea
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          rows={6}
          placeholder="Décrivez votre bateau, ses points forts, les équipements inclus, les conditions de location..."
          value={details.description}
          onChange={(e) => onChange({ ...details, description: e.target.value })}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {details.description.length} / 50 caractères minimum
        </p>
      </div>

      <Input
        label="URL de l'image principale"
        placeholder="https://images.unsplash.com/photo-..."
        value={details.image}
        onChange={(e) => onChange({ ...details, image: e.target.value })}
        icon={<ImageIcon size={20} />}
      />
      {details.image && (
        <div className="mt-2">
          <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={details.image} 
              alt="Prévisualisation" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800';
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Prévisualisation de l'image</p>
        </div>
      )}
      <p className="text-sm text-gray-500">
        Laissez vide pour utiliser une image par défaut. Utilisez des URLs depuis Unsplash ou d'autres sources fiables.
      </p>
    </div>
  );
}

interface BoatFormStep4Props {
  equipment: string[];
  newEquipment: string;
  onEquipmentChange: (equipment: string[]) => void;
  onNewEquipmentChange: (value: string) => void;
  onAddEquipment: () => void;
  equipmentPresets: string[];
}

export function BoatFormStep4({
  equipment,
  newEquipment,
  onEquipmentChange,
  onNewEquipmentChange,
  onAddEquipment,
  equipmentPresets
}: BoatFormStep4Props) {
  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      onEquipmentChange(equipment.filter(e => e !== item));
    } else {
      onEquipmentChange([...equipment, item]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Package className="text-ocean-600 mb-2" size={32} />
        <h3 className="text-gray-900 mb-2">Équipements disponibles</h3>
        <p className="text-gray-600">
          Sélectionnez les équipements présents sur votre bateau pour attirer plus de locataires
        </p>
      </div>

      <div>
        <label className="block mb-3 text-gray-700">Équipements courants</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {equipmentPresets.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleEquipment(item)}
              className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                equipment.includes(item)
                  ? 'border-ocean-600 bg-ocean-50 text-ocean-700'
                  : 'border-gray-300 hover:border-ocean-300'
              }`}
            >
              {equipment.includes(item) && '✓ '}
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-gray-700">Ajouter un équipement personnalisé</label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Sonar, Radar..."
            value={newEquipment}
            onChange={(e) => onNewEquipmentChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddEquipment();
              }
            }}
          />
          <Button type="button" onClick={onAddEquipment}>
            Ajouter
          </Button>
        </div>
      </div>

      {equipment.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Équipements sélectionnés : {equipment.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {equipment.filter(e => !equipmentPresets.includes(e)).map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-ocean-100 text-ocean-700 rounded-full text-sm flex items-center gap-2"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onEquipmentChange(equipment.filter(e => e !== item))}
                  className="hover:text-ocean-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface BoatFormStep5Props {
  basicInfo: BasicInfo;
  location: Location;
  details: Details;
  equipment: string[];
  mode?: 'create' | 'edit';
}

export function BoatFormStep5({ basicInfo, location, details, equipment, mode = 'create' }: BoatFormStep5Props) {
  return (
    <div className="space-y-6">
      <div className='mt-3'>
        <CheckCircle className="text-ocean-600 mb-2" size={32} />
        <h3 className="text-gray-900 mb-2">
          {mode === 'create' ? 'Récapitulatif de votre annonce' : 'Récapitulatif des modifications'}
        </h3>
        <p className="text-gray-600">
          Vérifiez les informations avant {mode === 'create' ? 'de créer l\'annonce' : 'd\'enregistrer'}
        </p>
      </div>

      {/* Photo principale */}
      {details.image && (
        <div className="p-4 bg-ocean-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">Photo principale :</p>
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <img 
              src={details.image} 
              alt="Photo principale" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800';
              }}
            />
          </div>
        </div>
      )}

      {/* Récapitulatif */}
      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <h4 className="text-gray-900 mb-3">Informations du bateau</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Nom :</span>
            <span className="text-gray-900">{basicInfo.name}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Type :</span>
            <span className="text-gray-900">
              {((boatService as any).constructor?.boatTypes || []).find((t: any) => t.value === basicInfo.type)?.label || basicInfo.type}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Année :</span>
            <span className="text-gray-900">{basicInfo.year}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Longueur :</span>
            <span className="text-gray-900">{basicInfo.length}m</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Capacité :</span>
            <span className="text-gray-900">{basicInfo.capacity} personnes</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Cabines :</span>
            <span className="text-gray-900">{basicInfo.cabins || 0}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Localisation :</span>
            <span className="text-gray-900">{location.city}, {location.country}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Prix :</span>
            <span className="text-gray-900">{details.price}€/jour</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Équipements :</span>
            <span className="text-gray-900">{equipment.length}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">Description :</p>
        <p className="text-gray-600 text-sm">{details.description}</p>
      </div>

      {/* Équipements */}
      {equipment.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">Équipements ({equipment.length}) :</p>
          <div className="flex flex-wrap gap-2">
            {equipment.map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-white border border-ocean-200 text-ocean-700 rounded-full text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
