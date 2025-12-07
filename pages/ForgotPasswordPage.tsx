import { useState } from 'react';
import { Mail} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Page } from '../types/navigation';
import { authService } from '../services/ServiceFactory';

interface ForgotPasswordPageProps {
  onNavigate: (page: Page) => void;
}

export function ForgotPasswordPage({onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<1|2|3>(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  // authService imported above

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // Request reset code
    setLoading(true);
    authService.requestPasswordResetCode(email)
      .then(resp => {
        setMessage(resp.message || 'If the email exists, a code has been sent.');
        setStep(2);
      })
      .catch(() => setError('Erreur réseau'))
      .finally(() => setLoading(false));
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!code) { setError('Veuillez entrer le code reçu par email'); return; }

    setLoading(true);
    try {
      const resp = await authService.verifyPasswordResetCode(email, code);
      if (!resp.success) {
        setError(resp.message || 'Code invalide');
        return;
      }
      // Store the reset token returned by the API to use in the final reset step
      if ((resp as any).resetToken) setResetToken((resp as any).resetToken);
      setMessage('Code validé. Vous pouvez réinitialiser votre mot de passe.');
      setStep(3);
    } catch {
      setError('Erreur réseau');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || newPassword.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }

    setLoading(true);
    try {
      // Use stored resetToken from verify step
      if (!resetToken) { setError('Token absent, veuillez vérifier le code d\'abord'); return; }
      const resetResp = await authService.resetPassword(email, resetToken, newPassword);
      if (!resetResp.success) {
        setError(resetResp.message || (resetResp.errors && resetResp.errors[0]?.description) || 'Erreur lors du reset');
        return;
      }

      setMessage('Mot de passe mis à jour. Vous pouvez vous connecter.');
      setTimeout(() => onNavigate('login'), 1500);
    } catch {
      setError('Erreur réseau');
    } finally { setLoading(false); }
  };

  return ( 
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="text-center mb-8">
          <h3 className="text-gray-900 mb-6">Mot de passe oublié</h3>
          <p className="text-gray-600 mb-6">Suivez les étapes pour réinitialiser votre mot de passe.</p>
        </div>

        <Card className="p-8">
          {error && <Alert type="error">{error}</Alert>}
          {message && <Alert type="info">{message}</Alert>}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Adresse email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} />}
              />
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <Input
                type="text"
                label="Code reçu"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <Input
                type="password"
                label="Nouveau mot de passe"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          )}

          <button
            onClick={() => onNavigate('login')}
            className="w-full mt-4 text-ocean-600 hover:text-ocean-700"
          >
            Retour à la connexion
          </button>
        </Card>
      </div>
    </div>
  );

}
