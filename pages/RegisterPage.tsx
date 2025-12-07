import  { useState } from 'react';
import { Mail, Lock, User, Phone, Anchor } from 'lucide-react';
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

export function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Call the auth service to register
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

    const formatApiError = (msg: string | undefined): string => {
      if (!msg) return 'Erreur lors de l\'inscription';

      // Try to find JSON blob inside the message
      try {
        const jsonStart = msg.indexOf('{');
        if (jsonStart !== -1) {
          const jsonPart = msg.substring(jsonStart);
          const body = JSON.parse(jsonPart);
          // ProblemDetails with errors
          if (body) {
            const title = body.title || body.message || 'Validation failed';
            if (body.errors && typeof body.errors === 'object') {
              const msgs: string[] = [];
              for (const key of Object.keys(body.errors)) {
                const arr = body.errors[key];
                if (Array.isArray(arr)) msgs.push(...arr.map((s: any) => String(s)));
              }
              if (msgs.length) return `${title}: ${msgs.join(' — ')}`;
            }
            if (body.title) return String(body.title);
            return JSON.stringify(body);
          }
        }
      } catch (e) {
        // parse failed - fallthrough
      }

      // Strip common prefixes like 'HTTP 400: - '
      const cleaned = msg.replace(/^HTTP \d+: - /, '').replace(/^HTTP \d+: /, '');
      return cleaned;
    };

    try {
      const resp = await authService.register(registerData);

      if (!resp.success) {
        // Prefer structured errors array if provided
        if ((resp as any).errors && Array.isArray((resp as any).errors) && (resp as any).errors.length) {
          const arr = (resp as any).errors as Array<{ code?: string; description?: string }>;
          setError(arr.map(a => a.description).join(' — '));
          return;
        }

        // Otherwise format the message (may contain ProblemDetails JSON)
        setError(formatApiError(resp.message));
        return;
      }

      // On success, ensure the user is authenticated before proceeding
      try {
        debugger;
        let authResp = resp as any;

        // If register didn't return user/tokens, attempt to login with provided credentials
        if (!authResp.user && !(authResp.token || authResp.tokens)) {
          try {
            authResp = await authService.login({ email: formData.email, password: formData.password });
          } catch (e) {
            // ignore here, we'll try getCurrentUser as fallback
          }
        }

        // If still not authenticated, try to rehydrate current user
        if (!authResp.success || !authResp.user) {
          const me = await authService.getCurrentUser();
          if (!me) {
            setError('Impossible de s\'authentifier après l\'inscription. Veuillez vous connecter.');
            return;
          }
        }

        // Now authenticated (or rehydrated) — proceed
        onRegister(userType);
      } catch (e) {
        setError('Erreur lors de l\'authentification après l\'inscription');
      }
    } catch (err: any) {
      const msg = err?.message ? formatApiError(err.message) : 'Erreur réseau lors de l\'inscription';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div style={{ width: '100%', maxWidth: '42rem', margin: '0 auto' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ocean-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Anchor className="text-white" size={32} />
          </div>
          <h2 className="text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-gray-600">Rejoignez la communauté SailingLoc</p>
        </div>

        <Card className="p-8">
          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setUserType('renter')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'renter'
                  ? 'border-ocean-600 bg-ocean-50'
                  : 'border-gray-200 hover:border-ocean-300'
              }`}
            >
              <div className="text-center">
                <User className="mx-auto mb-2 text-ocean-600" size={32} />
                <div className="text-gray-900">Locataire</div>
                <div className="text-sm text-gray-600 mt-1">Je veux louer un bateau</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setUserType('owner')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'owner'
                  ? 'border-ocean-600 bg-ocean-50'
                  : 'border-gray-200 hover:border-ocean-300'
              }`}
            >
              <div className="text-center">
                <Anchor className="mx-auto mb-2 text-ocean-600" size={32} />
                <div className="text-gray-900">Propriétaire</div>
                <div className="text-sm text-gray-600 mt-1">Je veux louer mon bateau</div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error">{error}</Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Prénom *"
                placeholder="Jean"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                icon={<User size={20} />}
              />

              <Input
                type="text"
                label="Nom *"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                icon={<User size={20} />}
              />
            </div>

            <Input
              type="email"
              label="Adresse email *"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail size={20} />}
            />

            <Input
              type="tel"
              label="Téléphone  *"
              placeholder="+33 6 12 34 56 78"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              icon={<Phone size={20} />}
            />

            <Input
              type="date"
              label="Date de naissance *"
              placeholder="Date de naissance"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              icon={<User size={20} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Rue et numéro *"
                placeholder="12 Rue de la Mer"
                value={formData.address.street}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              />

              <Input
                type="text"
                label="Ville *"
                placeholder="Bordeaux"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              />

              <Input
                type="text"
                label="Province   *"
                placeholder="ile-de-France"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
              />

              <Input
                type="text"
                label="Code postal *"
                placeholder="33000"
                value={formData.address.postalCode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
              />

              <Input
                type="text"
                label="Pays *"
                placeholder="France"
                value={formData.address.country}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
              />
            </div>

            <Input
              type="password"
              label="Mot de passe *"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              icon={<Lock size={20} />}
            />

            <Input
              type="password"
              label="Confirmer le mot de passe *"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              icon={<Lock size={20} />}
            />

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                id="terms"
                required
                className="mt-1 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                J'accepte les{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="text-ocean-600 hover:text-ocean-700"
                >
                  conditions générales
                </button>
                {' '}et la{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="text-ocean-600 hover:text-ocean-700"
                >
                  politique de confidentialité
                </button>
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-ocean-600 hover:text-ocean-700"
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
