import  { useState, useEffect } from 'react';
import { ArrowLeft, Ship, DollarSign, Users, Anchor, Calendar, Image as ImageIcon, CheckCircle, MapPin, Package } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { FormHelperTips } from '../components/boats/FormHelperTips';
import { Page } from '../types/navigation';
import { FormProgress } from '../components/boats/FormProgress';

import { boatService, destinationService, authService, homeService } from '../services/ServiceFactory';

interface CreateBoatListingPageProps {
  onNavigate: (page: Page, data?: any) => void;
  ownerId: string;
  ownerName?: string;
}

export function CreateBoatListingPage({ onNavigate, ownerId }: CreateBoatListingPageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Étape 1: Informations de base
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    type: 'sailboat',
    year: new Date().getFullYear(),
    length: '',
    capacity: '',
    cabins: '',
  });

  // Étape 2: Localisation
  const [location, setLocation] = useState({
    city: '',
    location: '',
    country: '',
    destinationId: undefined as number | undefined,
  });

  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<any[]>([]);

  // Étape 3: Prix et description
  const [details, setDetails] = useState({
    price: '',
    description: '',
    image: '',
  });

  // Étape 4: Équipements
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');

  // Étape 5: Photos supplémentaires
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const equipmentPresets = [
    'GPS',
    'Pilote automatique',
    'Guindeau électrique',
    'Annexe avec moteur',
    'Climatisation',
    'Dessalinisateur',
    'Wi-Fi',
    'Bluetooth audio',
    'Plateforme de bain',
    'Douche de cockpit',
    'Barbecue',
    'Paddle',
    'Matériel de pêche',
    'Matériel de plongée'
  ];

  // Load destinations for country/destination selects
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const ds = await (destinationService as any).getAllDestinations ? await (destinationService as any).getAllDestinations() : [];
        if (!mounted) return;
        setAllDestinations(ds || []);
        const countries = Array.from(new Set((ds || []).map((d: any) => String(d.country)).filter(Boolean)));
        setCountryOptions(countries as string[]);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

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

  const validateStep1 = () => {
    if (!basicInfo.name.trim()) {
      setError('Le nom du bateau est obligatoire');
      return false;
    }
    if (!basicInfo.length || parseFloat(basicInfo.length) <= 0) {
      setError('La longueur doit être supérieure à 0');
      return false;
    }
    if (!basicInfo.capacity || parseInt(basicInfo.capacity) <= 0) {
      setError('La capacité doit être supérieure à 0');
      return false;
    }
    if (basicInfo.year < 1900 || basicInfo.year > new Date().getFullYear() + 1) {
      setError('Année de construction invalide');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!location.city.trim() || !location.location.trim() || !location.country.trim()) {
      setError('Tous les champs de localisation sont obligatoires');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!details.price || parseFloat(details.price) <= 0) {
      setError('Le prix doit être supérieur à 0');
      return false;
    }
    if (!details.description.trim()) {
      setError('La description est obligatoire');
      return false;
    }
    if (details.description.length < 50) {
      setError('La description doit contenir au moins 50 caractères');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Ensure ownerId is a GUID string as expected by the backend CreateBoatDto
      const isGuid = (s: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s);
      let ownerGuid: string | undefined = undefined;
      if (ownerId && isGuid(ownerId)) {
        ownerGuid = ownerId;
      } else {
        try {
          const current = await authService.getCurrentUser();
          if (current && current.id && typeof current.id === 'string' && isGuid(current.id)) {
            ownerGuid = current.id;
          }
        } catch (e) {
          // ignore, we'll check ownerGuid below
        }
      }

      if (!ownerGuid) {
        throw new Error('Impossible de déterminer OwnerId (GUID). Veuillez vous reconnecter.');
      }

      // Try to derive numeric ownerId expected by CreateBoatDto
      let numericOwnerId: number | undefined = undefined;
      try {
        const current = await authService.getCurrentUser();
        if (current && typeof current.id === 'number') numericOwnerId = current.id;
      } catch {}
      if (numericOwnerId === undefined) {
        const parsed = Number(ownerGuid);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) numericOwnerId = parsed;
      }
      if (numericOwnerId === undefined) {
        throw new Error('Impossible de déterminer l\'identifiant numérique du propriétaire');
      }
      const selectedDestination = location.destinationId ? allDestinations.find(d => Number(d.id) === Number(location.destinationId)) : undefined;

      const boatData = {
        name: basicInfo.name,
        type: basicInfo.type,
        year: basicInfo.year,
        length: parseFloat(basicInfo.length),
        capacity: parseInt(basicInfo.capacity),
        cabins: parseInt(basicInfo.cabins) || 0,
        city: location.city,
        location: location.location,
        country: location.country,
        destinationId: selectedDestination ? selectedDestination.id : undefined,
        price: parseFloat(details.price),
        description: details.description,
        image: details.image || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
        equipment,
        images: photos && photos.length ? photos : undefined,
        ownerId: numericOwnerId
      };

      await boatService.createBoat(boatData);
      
      setSuccess(true);
      setTimeout(() => {
        onNavigate('owner-dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment('');
    }
  };

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className=" w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-gray-900 mb-2">Annonce créée avec succès !</h2>
          <p className="text-gray-600 mb-4">
            Votre bateau "{basicInfo.name}" est maintenant en ligne.
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers votre tableau de bord...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => step === 1 ? onNavigate('owner-dashboard') : handleBack()}
            className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          <h1 className="text-gray-900">Créer une nouvelle annonce</h1>
          <p className="text-gray-600">
            Remplissez les informations de votre bateau pour créer une annonce
          </p>
        </div>

        {/* Progress */}
        <FormProgress
          currentStep={step}
          totalSteps={6}
          labels={['Infos', 'Lieu', 'Prix', 'Équip.', 'Photos', 'Récap.']}
        />

        {/* Form */}
        <Card className="p-6 md:p-8">
          {error && (
            <Alert type="error">
              {error}
            </Alert>
          )}

          {/* Étape 1: Informations de base */}
          {step === 1 && (
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
                onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
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
                  onChange={(e) => setBasicInfo({ ...basicInfo, type: e.target.value })}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Année *"
                  placeholder="2020"
                  value={basicInfo.year}
                  onChange={(e) => setBasicInfo({ ...basicInfo, year: parseInt(e.target.value) })}
                  icon={<Calendar size={20} />}
                  required
                />

                <Input
                  type="number"
                  label="Longueur (m) *"
                  placeholder="12.5"
                  step="0.1"
                  value={basicInfo.length}
                  onChange={(e) => setBasicInfo({ ...basicInfo, length: e.target.value })}
                  icon={<Anchor size={20} />}
                  required
                />

                <Input
                  type="number"
                  label="Capacité *"
                  placeholder="8"
                  value={basicInfo.capacity}
                  onChange={(e) => setBasicInfo({ ...basicInfo, capacity: e.target.value })}
                  icon={<Users size={20} />}
                  required
                />
              </div>

              <Input
                type="number"
                label="Nombre de cabines"
                placeholder="3"
                value={basicInfo.cabins}
                onChange={(e) => setBasicInfo({ ...basicInfo, cabins: e.target.value })}
              />
            </div>
          )}

          {/* Étape 2: Localisation */}
          {step === 2 && (
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
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                required
              />

              <Input
                label="Localisation précise *"
                placeholder="Ex: Port de Nice, Marina Baie des Anges..."
                value={location.location}
                onChange={(e) => setLocation({ ...location, location: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm text-gray-700 mb-2">Pays *</label>
                <Select
                  options={[{ value: '', label: 'Choisir un pays' }, ...countryOptions.map(c => ({ value: c, label: c }))]}
                  value={location.country}
                  onChange={(e) => {
                    const country = e.target.value;
                    setLocation({ ...location, country, destinationId: undefined });
                    const filtered = allDestinations.filter(d => d.country === country);
                    setDestinationOptions(filtered || []);
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Destination / Région</label>
                <Select
                  options={[{ value: '', label: 'Choisir une destination' }, ...(destinationOptions.map((d: any) => ({ value: String(d.id), label: `${d.name} (${d.region})` })))]}
                  value={location.destinationId ? String(location.destinationId) : ''}
                  onChange={(e) => setLocation({ ...location, destinationId: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          )}

          {/* Étape 3: Prix et description */}
          {step === 3 && (
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
                onChange={(e) => setDetails({ ...details, price: e.target.value })}
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
                  onChange={(e) => setDetails({ ...details, description: e.target.value })}
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
                onChange={(e) => setDetails({ ...details, image: e.target.value })}
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
          )}

          {/* Étape 4: Équipements */}
          {step === 4 && (
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
                    onChange={(e) => setNewEquipment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                  />
                  <Button type="button" onClick={addEquipment}>
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
                          onClick={() => setEquipment(equipment.filter(e => e !== item))}
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
          )}

          {/* Étape 5: Photos supplémentaires */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <ImageIcon className="text-ocean-600 mb-2" size={32} />
                <h3 className="text-gray-900 mb-2">Galerie photos</h3>
                <p className="text-gray-600">
                  Ajoutez des photos supplémentaires pour mettre en valeur votre bateau (optionnel)
                </p>
              </div>

              {/* Photo principale recap */}
              {details.image && (
                <div className="p-4 bg-ocean-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Photo principale :</p>
                  <div className="w-full h-48 rounded-lg overflow-hidden">
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

              <div>
                <label className="block mb-2 text-gray-700">Ajouter des photos supplémentaires</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL de la photo (https://...)"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPhotoUrl.trim() && photos.length < 8) {
                          setPhotos([...photos, newPhotoUrl.trim()]);
                          setNewPhotoUrl('');
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (newPhotoUrl.trim() && photos.length < 8) {
                        setPhotos([...photos, newPhotoUrl.trim()]);
                        setNewPhotoUrl('');
                      }
                    }}
                    disabled={photos.length >= 8}
                  >
                    Ajouter
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {photos.length} / 8 photos ajoutées
                </p>
              </div>

              {photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-700 mb-3">Photos ajoutées :</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-32 rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Étape 6: Récapitulatif */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="mt-3">
                <CheckCircle className="text-ocean-600 mb-2" size={32} />
                <h3 className="text-gray-900 mb-2">Récapitulatif des informations avant la validation</h3>
                <p className="text-gray-600">
                  Vérifiez les informations avant d'enregistrer
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
                      {types.find(t => t.value === basicInfo.type)?.label || basicInfo.type}
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

              {/* Photos supplémentaires (thumbnails) */}
              {photos && photos.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">Photos supplémentaires :</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {photos.map((url, i) => (
                      <div key={i} className="w-full h-20 rounded overflow-hidden border">
                        <img
                          src={url}
                          alt={`Photo supplémentaire ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400';}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack} disabled={loading}>
                Précédent
              </Button>
            )}
            <div className={step === 1 ? 'ml-auto' : ''}>
              {step < 6 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Suivant
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Création...' : 'Créer l\'annonce'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Helper Tips */}
        <FormHelperTips step={step} />
      </div>
    </div>
  );
}
