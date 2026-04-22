import { useState } from 'react';
import { Mail, Lock, User, Phone, Ship, MapPin, ChevronRight, ChevronLeft, Check, Anchor } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Page } from '../types/navigation';
import { authService } from '../services/ServiceFactory';

interface RegisterPageProps {
  onRegister: (userType: 'renter' | 'owner') => void;
  onNavigate: (page: Page) => void;
}

/** Map backend error messages to user-friendly French messages */
function formatApiError(msg: string | undefined): string {
  if (!msg) return 'Erreur lors de l\'inscription.';

  // Try to find JSON blob inside the message
  try {
    const jsonStart = msg.indexOf('{');
    if (jsonStart !== -1) {
      const jsonPart = msg.substring(jsonStart);
      const body = JSON.parse(jsonPart);
      if (body) {
        const title = body.title || body.message || '';
        if (body.errors && typeof body.errors === 'object') {
          const msgs: string[] = [];
          for (const key of Object.keys(body.errors)) {
            const arr = body.errors[key];
            if (Array.isArray(arr)) msgs.push(...arr.map((s: any) => String(s)));
          }
          if (msgs.length) return msgs.join(' — ');
        }
        if (title) return String(title);
      }
    }
  } catch {
    // parse failed - fallthrough
  }

  const lower = msg.toLowerCase();
  if (lower.includes('duplicate') || lower.includes('already exists') || lower.includes('email is already'))
    return 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.';
  if (lower.includes('password') && lower.includes('weak'))
    return 'Le mot de passe est trop faible. Utilisez au moins 8 caractères avec des lettres et des chiffres.';
  if (lower.includes('network') || lower.includes('fetch'))
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';

  // Strip HTTP prefixes
  const cleaned = msg.replace(/^HTTP \d+: - /, '').replace(/^HTTP \d+: /, '');
  // If contains French chars, pass through
  if (/[àâäéèêëïîôùûüç]/i.test(cleaned)) return cleaned;
  return 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
}

const STEPS = [
  { id: 1, title: 'Type de compte', description: 'Choisissez votre profil' },
  { id: 2, title: 'Informations', description: 'Vos coordonnées' },
  { id: 3, title: 'Adresse', description: 'Votre localisation' },
  { id: 4, title: 'Sécurité', description: 'Mot de passe & validation' },
];

export function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'renter' | 'owner'>('renter');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Per-step validation - returns map of field -> error message (empty means no error)
  const getFieldErrors = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (step === 2) {
      if (!formData.firstName.trim()) errs.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) errs.lastName = 'Le nom est requis';
      if (!formData.email.trim()) errs.email = 'L\'email est requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Adresse email invalide';
      if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Le numéro de téléphone est requis';
    }
    if (step === 3) {
      if (!formData.address.street.trim()) errs.street = 'La rue est requise';
      if (!formData.address.city.trim()) errs.city = 'La ville est requise';
      if (!formData.address.postalCode.trim()) errs.postalCode = 'Le code postal est requis';
      if (!formData.address.country.trim()) errs.country = 'Le pays est requis';
    }
    if (step === 4) {
      if (!formData.password) errs.password = 'Le mot de passe est requis';
      else if (formData.password.length < 8) errs.password = 'Le mot de passe doit contenir au moins 8 caractères';
      if (!formData.confirmPassword) errs.confirmPassword = 'Veuillez confirmer le mot de passe';
      else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
      if (!acceptedTerms) errs.terms = 'Vous devez accepter les conditions générales';
    }
    return errs;
  };

  const validateStep = (step: number): string[] => Object.values(getFieldErrors(step));

  const currentStepErrors = getFieldErrors(currentStep);
  const isStepValid = Object.keys(currentStepErrors).length === 0;
  const showErr = (key: string) => (touched[key] ? currentStepErrors[key] : '') || '';

  const markStepTouched = (step: number) => {
    const fields = Object.keys(getFieldErrors(step));
    if (fields.length === 0) return;
    setTouched(prev => {
      const next = { ...prev };
      fields.forEach(f => { next[f] = true; });
      return next;
    });
  };

  const nextStep = () => {
    const errs = validateStep(currentStep);
    if (errs.length > 0) {
      markStepTouched(currentStep);
      setError(errs[0]);
      return;
    }
    setError('');
    setCurrentStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep(4);
    if (errs.length > 0) {
      markStepTouched(4);
      setError(errs[0]);
      return;
    }

    setError('');
    setLoading(true);

    const registerData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: (userType === 'owner' ? 'Owner' : 'Renter') as 'Owner' | 'Renter',
      phoneNumber: formData.phoneNumber,
      birthDate: formData.birthDate || undefined,
      address: {
        street: formData.address.street || undefined,
        city: formData.address.city || undefined,
        state: formData.address.state || undefined,
        postalCode: formData.address.postalCode || undefined,
        country: formData.address.country || undefined,
      },
      avatarBase64: undefined,
    };

    try {
      const resp = await authService.register(registerData);

      if (!resp.success) {
        if ((resp as any).errors && Array.isArray((resp as any).errors) && (resp as any).errors.length) {
          const arr = (resp as any).errors as Array<{ code?: string; description?: string }>;
          setError(arr.map(a => a.description).join(' — '));
          return;
        }
        setError(formatApiError(resp.message));
        return;
      }

      // On success, ensure user is authenticated
      try {
        let authResp = resp as any;
        if (!authResp.user && !(authResp.token || authResp.tokens)) {
          try {
            authResp = await authService.login({ email: formData.email, password: formData.password });
          } catch {
            // ignore, try getCurrentUser
          }
        }
        if (!authResp.success || !authResp.user) {
          const me = await authService.getCurrentUser();
          if (!me) {
            setError('Compte créé ! Veuillez vous connecter.');
            return;
          }
        }
        onRegister(userType);
      } catch {
        setError('Compte créé avec succès. Veuillez vous connecter.');
      }
    } catch (err: any) {
      setError(formatApiError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-turquoise-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ocean-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Anchor className="text-white" size={28} />
          </div>
          <h2 className="text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-gray-500">Rejoignez la communauté SailingLoc</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white shadow-md'
                        : currentStep === step.id
                          ? 'bg-ocean-600 text-white shadow-lg ring-4 ring-ocean-100'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={18} /> : step.id}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <div className={`text-xs font-medium ${currentStep >= step.id ? 'text-ocean-600' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8 shadow-lg border-0">
          {error && (
            <Alert type="error" onClose={() => setError('')}>{error}</Alert>
          )}

          {/* Step 1: User Type */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-gray-900 mb-2 text-center">Quel type de compte souhaitez-vous ?</h3>
              <p className="text-gray-500 text-center mb-8">Vous pourrez modifier cette information plus tard.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('renter')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                    userType === 'renter'
                      ? 'border-ocean-600 bg-ocean-50 shadow-md'
                      : 'border-gray-200 hover:border-ocean-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${userType === 'renter' ? 'bg-ocean-100' : 'bg-gray-100'}`}>
                    <User className={userType === 'renter' ? 'text-ocean-600' : 'text-gray-500'} size={24} />
                  </div>
                  <div className="text-gray-900 font-semibold mb-1">Locataire</div>
                  <div className="text-sm text-gray-500">Je souhaite louer un bateau pour mes sorties en mer</div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('owner')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                    userType === 'owner'
                      ? 'border-ocean-600 bg-ocean-50 shadow-md'
                      : 'border-gray-200 hover:border-ocean-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${userType === 'owner' ? 'bg-ocean-100' : 'bg-gray-100'}`}>
                    <Ship className={userType === 'owner' ? 'text-ocean-600' : 'text-gray-500'} size={24} />
                  </div>
                  <div className="text-gray-900 font-semibold mb-1">Propriétaire</div>
                  <div className="text-sm text-gray-500">Je souhaite proposer mon bateau à la location</div>
                </button>
              </div>

              <div className="mt-8 flex justify-end">
                <Button variant="primary" onClick={nextStep}>
                  Continuer <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-gray-900 mb-1 text-center">Informations personnelles</h3>
              <p className="text-gray-500 text-center mb-6">Renseignez vos coordonnées</p>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Prénom *"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
                    icon={<User size={20} />}
                    autoComplete="given-name"
                    required
                    error={showErr('firstName')}
                  />
                  <Input
                    type="text"
                    label="Nom *"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, lastName: true }))}
                    icon={<User size={20} />}
                    autoComplete="family-name"
                    required
                    error={showErr('lastName')}
                  />
                </div>

                <Input
                  type="email"
                  label="Adresse email *"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  icon={<Mail size={20} />}
                  autoComplete="email"
                  required
                  error={showErr('email')}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                />

                <Input
                  type="tel"
                  label="Téléphone *"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, phoneNumber: true }))}
                  icon={<Phone size={20} />}
                  autoComplete="tel"
                  required
                  error={showErr('phoneNumber')}
                />

                <Input
                  type="date"
                  label="Date de naissance"
                  value={formData.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                  autoComplete="bday"
                />
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft size={18} /> Retour
                </Button>
                <Button variant="primary" onClick={nextStep} disabled={!isStepValid}>
                  Continuer <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-gray-900 mb-1 text-center">Adresse</h3>
              <p className="text-gray-500 text-center mb-6">Votre adresse de résidence</p>

              <div className="space-y-5">
                <Input
                  type="text"
                  label="Rue et numéro *"
                  placeholder="12 Rue de la Mer"
                  value={formData.address.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, street: true }))}
                  icon={<MapPin size={20} />}
                  autoComplete="street-address"
                  required
                  error={showErr('street')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Ville *"
                    placeholder="La Rochelle"
                    value={formData.address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, city: true }))}
                    autoComplete="address-level2"
                    required
                    error={showErr('city')}
                  />
                  <Input
                    type="text"
                    label="Région"
                    placeholder="Nouvelle-Aquitaine"
                    value={formData.address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    autoComplete="address-level1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Code postal *"
                    placeholder="17000"
                    value={formData.address.postalCode}
                    onChange={(e) => updateAddress('postalCode', e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, postalCode: true }))}
                    autoComplete="postal-code"
                    required
                    error={showErr('postalCode')}
                  />
                  <Input
                    type="text"
                    label="Pays *"
                    placeholder="France"
                    value={formData.address.country}
                    onChange={(e) => updateAddress('country', e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, country: true }))}
                    autoComplete="country-name"
                    required
                    error={showErr('country')}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft size={18} /> Retour
                </Button>
                <Button variant="primary" onClick={nextStep} disabled={!isStepValid}>
                  Continuer <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Security */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <h3 className="text-gray-900 mb-1 text-center">Sécurité</h3>
              <p className="text-gray-500 text-center mb-6">Choisissez un mot de passe sécurisé</p>

              <div className="space-y-5">
                <Input
                  type="password"
                  label="Mot de passe *"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  icon={<Lock size={20} />}
                  autoComplete="new-password"
                  required
                  error={showErr('password')}
                />

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = formData.password.length >= 12 ? 4 : formData.password.length >= 10 ? 3 : formData.password.length >= 8 ? 2 : 1;
                        const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
                        return (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strength ? colors[strength - 1] : 'bg-gray-200'}`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.password.length < 8 ? 'Trop court' : formData.password.length < 10 ? 'Acceptable' : formData.password.length < 12 ? 'Bon' : 'Excellent'}
                    </p>
                  </div>
                )}

                <Input
                  type="password"
                  label="Confirmer le mot de passe *"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
                  icon={<Lock size={20} />}
                  autoComplete="new-password"
                  required
                  error={showErr('confirmPassword')}
                />

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setTouched(t => ({ ...t, terms: true }));
                    }}
                    className="mt-0.5 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    J'accepte les{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('terms')}
                      className="text-ocean-600 hover:text-ocean-700 font-medium"
                    >
                      conditions générales
                    </button>
                    {' '}et la{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('privacy')}
                      className="text-ocean-600 hover:text-ocean-700 font-medium"
                    >
                      politique de confidentialité
                    </button>
                  </label>
                </div>
                {showErr('terms') && (
                  <p className="text-sm text-red-600 mt-1">{showErr('terms')}</p>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" type="button" onClick={prevStep}>
                  <ChevronLeft size={18} /> Retour
                </Button>
                <Button type="submit" variant="primary" disabled={loading || !isStepValid}>
                  {loading ? 'Création en cours...' : 'Créer mon compte'}
                </Button>
              </div>
            </form>
          )}

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500">
              Déjà un compte ?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-ocean-600 hover:text-ocean-700 font-semibold transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
