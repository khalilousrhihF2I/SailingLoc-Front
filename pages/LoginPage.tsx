import { useState } from 'react';
import { Mail, Lock, Anchor } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Page } from '../types/navigation';
import { authService } from '../services/ServiceFactory';
import { getUserRole } from '../utils/getUserRole';

interface LoginPageProps {
  onLogin: (userType: 'renter' | 'owner' | 'admin') => void;
  onNavigate: (page: Page, data?: any) => void;
  pageData?: any;
}

/** Map backend error messages to user-friendly French messages */
function mapErrorToFrench(error: string): string {
  const lower = error.toLowerCase();
  if (lower.includes('invalid credentials') || lower.includes('unauthorized') || lower.includes('401'))
    return 'Adresse email ou mot de passe incorrect.';
  if (lower.includes('locked') || lower.includes('blocked'))
    return 'Votre compte a été temporairement bloqué. Veuillez réessayer plus tard.';
  if (lower.includes('not found') || lower.includes('no user'))
    return 'Aucun compte trouvé avec cette adresse email.';
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('econnrefused'))
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
  if (lower.includes('timeout'))
    return 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
  if (lower.includes('too many') || lower.includes('rate limit'))
    return 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.';
  // Already in French — pass through
  if (/[àâäéèêëïîôùûüç]/i.test(error)) return error;
  return 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
}

export function LoginPage({ onLogin, onNavigate, pageData }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = emailTouched && !email ? 'L\'adresse email est requise' : emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Adresse email invalide' : '';
  const passwordError = passwordTouched && !password ? 'Le mot de passe est requis' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.login({ email, password });
      if (!resp.success) {
        setError(mapErrorToFrench(resp.message || 'Email ou mot de passe incorrect'));
        return;
      }

      const inferred = getUserRole(resp.user as any, email);
      onLogin(inferred);

      try {
        if (pageData && pageData.redirect === 'booking') {
          onNavigate('booking-step1', pageData);
        }
      } catch {
        // ignore navigation errors
      }
    } catch (err: any) {
      setError(mapErrorToFrench(err?.message || 'network error'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (type: 'renter' | 'owner' | 'admin') => {
    setError('');
    const accounts = {
      renter: { email: 'Renter@local.test', password: 'Admin123' },
      owner: { email: 'Owner@local.test', password: 'Admin123' },
      admin: { email: 'admin@local.test', password: 'Admin123' }
    };
    setEmail(accounts[type].email);
    setPassword(accounts[type].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-turquoise-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ocean-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Anchor className="text-white" size={28} />
          </div>
          <h2 className="text-gray-900 mb-2">Connexion</h2>
          <p className="text-gray-500">Accédez à votre espace SailingLoc</p>
        </div>

        <Card className="p-8 shadow-lg border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error">{error}</Alert>
            )}

            <Input
              type="email"
              label="Adresse email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              icon={<Mail size={20} />}
              autoComplete="email"
              required
              error={emailError}
            />

            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              icon={<Lock size={20} />}
              autoComplete="current-password"
              required
              error={passwordError}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-ocean-600 hover:text-ocean-700 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500">
              Pas encore de compte ?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-ocean-600 hover:text-ocean-700 font-semibold transition-colors"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </Card>

        {/* Demo accounts */}
        <div className="mt-6 animate-fade-in-up stagger-1">
          <Card className="p-5 bg-ocean-50/60 border-ocean-100">
            <p className="text-sm text-ocean-700 mb-3 font-medium">Comptes de démonstration :</p>
            <div className="space-y-2">
              {([
                { type: 'renter' as const, label: 'Locataire', email: 'Renter@local.test', color: 'bg-blue-500' },
                { type: 'owner' as const, label: 'Propriétaire', email: 'Owner@local.test', color: 'bg-green-500' },
                { type: 'admin' as const, label: 'Administrateur', email: 'admin@local.test', color: 'bg-orange-500' },
              ]).map(({ type, label, email: demoEmail, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => fillDemoAccount(type)}
                  className="w-full px-4 py-2.5 bg-white border border-ocean-200 text-ocean-700 rounded-xl hover:bg-ocean-50 hover:border-ocean-300 transition-all text-sm flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 ${color} rounded-full`} />
                    <span className="font-medium">{label}</span>
                  </span>
                  <span className="text-xs text-ocean-500 group-hover:text-ocean-600">{demoEmail}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
