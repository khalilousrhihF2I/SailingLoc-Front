import  { useState } from 'react';
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

export function LoginPage({ onLogin, onNavigate, pageData }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const resp = await authService.login({ email, password });
      console.log('Login response:', resp);
      if (!resp.success) {
        setError(resp.message || 'Email ou mot de passe incorrect');
        return;
      }

      const inferred = getUserRole(resp.user as any, email);
      onLogin(inferred);

      // If a redirect was requested (e.g. booking flow), resume it now
      try {
        if (pageData && pageData.redirect === 'booking') {
          onNavigate('booking-step1', pageData);
        }
      } catch (e) {
        // ignore navigation errors
      }
    } catch (err) {
      setError('Erreur réseau lors de la connexion');
    }
  };

  const fillDemoAccount = (type: 'renter' | 'owner' | 'admin') => {
    setError('');
    const accounts = {
      renter: { email: 'renter@example.com', password: 'Demo123@@' },
      owner: { email: 'owner@example.com', password: 'Demo123@@' },
      admin: { email: 'admin@sailingloc.com', password: 'Demo123@@' }
    };
    setEmail(accounts[type].email);
    setPassword(accounts[type].password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ocean-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Anchor className="text-white" size={32} />
          </div>
          <h2 className="text-gray-900 mb-2">Connexion</h2>
          <p className="text-gray-600">Accédez à votre compte SailingLoc</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error">{error}</Alert>
            )}

            <Input
              type="email"
              label="Adresse email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
            />

            <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={20} />}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-sm text-gray-700">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-ocean-600 hover:text-ocean-700"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-ocean-600 hover:text-ocean-700"
              >
                S'inscrire
              </button>
            </p>
          </div>

          {/* Demo accounts info */}
          <div className="mt-6 p-4 bg-ocean-50 rounded-lg">
            <p className="text-sm text-ocean-800 mb-3">Comptes de démonstration :</p>
            <div className="space-y-2 mt-3 mb-3">
              <button
                type="button"
                onClick={() => fillDemoAccount('renter')}
                className="w-full px-4 py-2.5 bg-white border-2 border-ocean-200 text-ocean-700 rounded-lg hover:bg-ocean-100 hover:border-ocean-300 transition-all text-sm flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Locataire</span>
                </span>
                <span className="text-xs text-ocean-600 group-hover:text-ocean-700">renter@example.com</span>
              </button>
              
              <button
                type="button"
                onClick={() => fillDemoAccount('owner')}
                className="w-full px-4 py-2.5 bg-white border-2 border-ocean-200 text-ocean-700 rounded-lg hover:bg-ocean-100 hover:border-ocean-300 transition-all text-sm flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Propriétaire</span>
                </span>
                <span className="text-xs text-ocean-600 group-hover:text-ocean-700">owner@example.com</span>
              </button>
              
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="w-full px-4 py-2.5 bg-white border-2 border-ocean-200 text-ocean-700 rounded-lg hover:bg-ocean-100 hover:border-ocean-300 transition-all text-sm flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Administrateur</span>
                </span>
                <span className="text-xs text-ocean-600 group-hover:text-ocean-700">admin@sailingloc.com</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-ocean-600">
              Mot de passe : <b>Demo123@@</b>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

