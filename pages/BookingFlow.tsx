import  { useState, useEffect } from 'react';
import { CheckCircle, Shield, ArrowLeft, User, Mail, Phone, Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { StripeCheckout } from '../components/booking/StripeCheckout';
import { Page } from '../types/navigation';
import { authService, boatService, bookingService } from '../services/ServiceFactory';

interface BookingFlowProps {
  boatId: number;
  startDate: string;
  endDate: string;
  isLoggedIn?: boolean;
  onNavigate: (page: Page, data?: any) => void;
  onAccountCreated?: () => void;
}

export function BookingFlow({ 
  boatId, 
  startDate, 
  endDate, 
  isLoggedIn = false,
  onNavigate,
  onAccountCreated 
}: BookingFlowProps) {
  const [step, setStep] = useState(isLoggedIn ? 2 : 1); // Si connecté, aller directement au paiement
  
  // User Account Data
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    address: { street: '', city: '', state: '', postalCode: '', country: '' }
  });
  const [accountError, setAccountError] = useState('');

  const [boat, setBoat] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Load boat from API inside useEffect
  useEffect(() => {
    let mounted = true;
    const loadBoat = async () => {
      setLoading(true);
      setError('');
      try {
        const b = await boatService.getBoatById(boatId);
        if (!mounted) return;
        if (!b) {
          setError('Bateau non trouvé');
          setBoat(null);
        } else {
          setBoat(b);
        }
      } catch (e) {
        if (!mounted) return;
        setError('Erreur lors du chargement du bateau');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadBoat();
    // If already logged in, fetch current user info
    const loadUser = async () => {
      try {
        const u = await authService.getCurrentUser();
        if (!mounted) return;
        setCurrentUser(u);
      } catch (e) {
        // ignore
      }
    };

    if (isLoggedIn) loadUser();
    return () => { mounted = false; };
  }, [boatId]);

  if (loading || !boat) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-600">{error || 'Chargement...'}</div>
    </div>
  );

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const subtotal = days * boat.price;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;
  const bookingId = 'BK' + Date.now().toString(36).toUpperCase();

  // Handle Account Creation/Validation
  const handleAccountStep = async () => {
    setAccountError('');

    if (!accountData.firstName || !accountData.lastName || !accountData.email || !accountData.phoneNumber) {
      setAccountError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountData.email)) {
      setAccountError('Adresse email invalide');
      return;
    }

    if (!isLoggedIn) {
      if (!accountData.password || accountData.password.length < 8) {
        setAccountError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      if (accountData.password !== accountData.confirmPassword) {
        setAccountError('Les mots de passe ne correspondent pas');
        return;
      }

      // Prepare register DTO
      const registerDto = {
        email: accountData.email,
        password: accountData.password,
        firstName: accountData.firstName || 'Renter',
        lastName: accountData.lastName || 'User',
        role: 'Renter' as 'Renter',
        phoneNumber: accountData.phoneNumber,
        birthDate: accountData.birthDate || undefined,
        address: {
          street: accountData.address.street || undefined,
          city: accountData.address.city || undefined,
          state: accountData.address.state || undefined,
          postalCode: accountData.address.postalCode || undefined,
          country: accountData.address.country || undefined,
        },
        avatarBase64: undefined,
      };

      // Call authService.register and wait for result (handle validation errors)
      try {
        const resp = await authService.register(registerDto);
        if (!resp.success) {
          // If response contains detailed errors from API, concatenate them
          if ((resp as any).errors && Array.isArray((resp as any).errors)) {
            const arr = (resp as any).errors as Array<{ code?: string; description?: string }>;
            const combined = arr.map(a => a.description).join(' — ');
            setAccountError(combined || resp.message || 'Erreur lors de la création du compte');
            return;
          }

          setAccountError(resp.message || 'Erreur lors de la création du compte');
          return;
        }

        // Registration successful - user is now logged in automatically
        // The register method now auto-logs in the user if tokens weren't returned
        // Set the current user state
        if (resp.user && resp.user.id) {
          setCurrentUser(resp.user);
        } else {
          // If still no user info, try to fetch it
          try {
            const u = await authService.getCurrentUser();
            if (u) {
              setCurrentUser(u);
            }
          } catch (e) {
            // ignore
          }
        }

        // Notify parent component that user is now logged in
        if (onAccountCreated) onAccountCreated();
      } catch (e) {
        setAccountError('Erreur réseau lors de la création du compte');
        return;
      }
    }

    // Passer à l'étape de paiement
    setStep(2);
  };

  // Handle Payment Success
  const handlePaymentSuccess = async () => {
    // Ensure we have the latest current user info
    try {
      let u = currentUser;
      if (!u) {
        u = await authService.getCurrentUser();
        if (u) {
          setCurrentUser(u);
        }
      }
      console.log('Current user at payment success:', u);

      if (!u || !u.id) {
        // If still no user after trying to fetch, check if we have account data from registration
        // This can happen if the registration just completed but state hasn't synced
        if (!isLoggedIn && accountData.email && accountData.firstName) {
          // Try one more time to get the user after a brief delay
          await new Promise(resolve => setTimeout(resolve, 500));
          u = await authService.getCurrentUser();
          if (u) {
            setCurrentUser(u);
          }
        }
        
        if (!u || !u.id) {
          setAccountError('Veuillez vous connecter avant de finaliser la réservation');
          setStep(1);
          return;
        }
      }

      // Prevent owners from creating bookings
      if (u.type === 'owner') {
        setAccountError('Les propriétaires ne peuvent pas réserver de bateau. Veuillez utiliser un compte locataire.');
        setStep(1);
        return;
      }

      // Build DTO matching backend expectations
      const createDto = {
        BoatId: boat.id,
        StartDate: new Date(startDate).toISOString(),
        EndDate: new Date(endDate).toISOString(),
        DailyPrice: boat.price,
        ServiceFee: serviceFee,
        RenterId: u.id, // backend expects GUID — ensure your auth user id format matches
        RenterName: ((u as any).firstName || accountData.firstName) && ((u as any).lastName || accountData.lastName)
          ? `${(u as any).firstName || accountData.firstName} ${(u as any).lastName || accountData.lastName}`
          : u.name || `${accountData.firstName} ${accountData.lastName}`,
        RenterEmail: u.email || accountData.email,
        RenterPhone: (u as any).phoneNumber || accountData.phoneNumber || undefined,
      };

      const booking = await bookingService.createBooking(createDto as any);

      onNavigate('booking-confirmation', {
        bookingId: booking.id || bookingId,
        boat,
        startDate,
        endDate,
        totalPrice: total,
        serviceFee,
        renterEmail: createDto.RenterEmail,
        renterName: createDto.RenterName
      });
    } catch (e: any) {
      // If apiClient threw an ApiError with server message, surface that to the user
      const msg = e?.message || (e && String(e)) || 'Erreur lors de la création de la réservation';
      setAccountError(msg);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => step === 1 ? onNavigate('boat-detail', { boatId }) : setStep(1)}
          className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-ocean-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-ocean-600 text-white' : 'bg-gray-200'
              }`}>
                {step > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <span className="hidden sm:inline">Informations</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-ocean-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-ocean-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-ocean-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="hidden sm:inline">Paiement</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-gray-900 mb-6">
                  {isLoggedIn ? 'Vos informations' : 'Créer votre compte'}
                </h2>

                {!isLoggedIn && (
                  <Alert type="info">
                    Un compte sera créé automatiquement pour gérer votre réservation
                  </Alert>
                )}

                {accountError && (
                  <Alert type="error">{accountError}</Alert>
                )}

                {!isLoggedIn && (
                  <div className="text-sm text-gray-600 mb-4">
                    Vous avez déjà un compte ?
                    <button
                      type="button"
                      onClick={() => onNavigate('login', { redirect: 'booking', boatId, startDate, endDate })}
                      className="ml-2 text-ocean-600 hover:underline"
                    >
                      Se connecter
                    </button>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleAccountStep(); }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="Prénom *"
                      placeholder="Jean"
                      value={accountData.firstName}
                      onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                      icon={<User size={20} />}
                      required
                    />

                    <Input
                      type="text"
                      label="Nom *"
                      placeholder="Dupont"
                      value={accountData.lastName}
                      onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                      icon={<User size={20} />}
                      required
                    />
                  </div>

                  <Input
                    type="email"
                    label="Adresse email *"
                    placeholder="votre@email.com"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    icon={<Mail size={20} />}
                    required
                  />

                  <Input
                    type="tel"
                    label="Téléphone *"
                    placeholder="+33 6 12 34 56 78"
                    value={accountData.phoneNumber}
                    onChange={(e) => setAccountData({ ...accountData, phoneNumber: e.target.value })}
                    icon={<Phone size={20} />}
                    required
                  />

                  {!isLoggedIn && (
                    <>
                      <Input
                        type="password"
                        label="Mot de passe *"
                        placeholder="Minimum 8 caractères"
                        value={accountData.password}
                        onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                        icon={<Lock size={20} />}
                        required
                      />

                      <Input
                        type="password"
                        label="Confirmer le mot de passe *"
                        placeholder="Retapez votre mot de passe"
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                        icon={<Lock size={20} />}
                        required
                      />
                    </>
                  )}

                  {/* Address fields - required */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="text"
                      label="Rue *"
                      placeholder="123 Rue Principale"
                      value={accountData.address.street}
                      onChange={(e) => setAccountData({ ...accountData, address: { ...accountData.address, street: e.target.value } })}
                      required
                    />

                    <Input
                      type="text"
                      label="Ville *"
                      placeholder="Paris"
                      value={accountData.address.city}
                      onChange={(e) => setAccountData({ ...accountData, address: { ...accountData.address, city: e.target.value } })}
                      required
                    />

                    <Input
                      type="text"
                      label="État/Région *"
                      placeholder="Île-de-France"
                      value={accountData.address.state}
                      onChange={(e) => setAccountData({ ...accountData, address: { ...accountData.address, state: e.target.value } })}
                      required
                    />

                    <Input
                      type="text"
                      label="Code postal *"
                      placeholder="75001"
                      value={accountData.address.postalCode}
                      onChange={(e) => setAccountData({ ...accountData, address: { ...accountData.address, postalCode: e.target.value } })}
                      required
                    />

                    <Input
                      type="text"
                      label="Pays *"
                      placeholder="France"
                      value={accountData.address.country}
                      onChange={(e) => setAccountData({ ...accountData, address: { ...accountData.address, country: e.target.value } })}
                      required
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <Shield size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <div className="mb-1">Vos données sont protégées</div>
                        <div className="text-xs text-gray-600">
                          Nous utilisons le cryptage SSL pour sécuriser vos informations personnelles.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    Continuer vers le paiement
                  </Button>
                </form>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-gray-900 mb-6">Paiement sécurisé</h2>
                
                <StripeCheckout
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setStep(1)}
                />
              </Card>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-gray-900 mb-4">Récapitulatif</h3>
              
              <div className="mb-4">
                <img 
                  src={boat.image} 
                  alt={boat.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-gray-900 mb-2">{boat.name}</h4>
                <p className="text-sm text-gray-600">{boat.location}</p>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Départ</div>
                  <div className="text-gray-900">{formatDate(startDate)}</div>
                  <div className="text-xs text-gray-500">à partir de 14h00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Retour</div>
                  <div className="text-gray-900">{formatDate(endDate)}</div>
                  <div className="text-xs text-gray-500">avant 10h00</div>
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{boat.price}€ × {days} jours</span>
                  <span className="text-gray-900">{subtotal}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de service</span>
                  <span className="text-gray-900">{serviceFee.toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-900">Total</span>
                <span className="text-2xl text-ocean-600">{total.toFixed(2)}€</span>
              </div>

              <div className="bg-ocean-50 rounded-lg p-3 text-sm text-ocean-800">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="shrink-0 mt-0.5" />
                  <div className="text-xs">
                    Votre paiement est sécurisé et protégé par notre garantie satisfaction
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

