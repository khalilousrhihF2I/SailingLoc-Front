import  { useState } from 'react';
import { CreditCard, Lock, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({ amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      setError('Numéro de carte invalide');
      return;
    }
    if (expiryDate.length !== 5) {
      setError('Date d\'expiration invalide');
      return;
    }
    if (cvv.length !== 3) {
      setError('CVV invalide');
      return;
    }
    if (!cardName.trim()) {
      setError('Nom du titulaire requis');
      return;
    }

    setProcessing(true);

    // Simuler un appel API Stripe
    setTimeout(() => {
      // Test cards pour démo
      const cleanNumber = cleanCardNumber.replace(/\s/g, '');
      
      if (cleanNumber === '4242424242424242') {
        // Carte test Stripe - succès
        setProcessing(false);
        onSuccess();
      } else if (cleanNumber === '4000000000000002') {
        // Carte test Stripe - refus
        setProcessing(false);
        setError('Paiement refusé. Veuillez vérifier vos informations.');
      } else {
        // Autre carte - succès pour la démo
        setProcessing(false);
        onSuccess();
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Secure Payment Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <Lock size={16} className="text-ocean-600" />
        <span>Paiement sécurisé par Stripe</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        {/* Test Cards Info */}
        <Card className="p-4 bg-ocean-50 border-ocean-200">
          <div className="text-sm text-ocean-800">
            <div className="mb-2">💳 Cartes de test :</div>
            <div className="space-y-1 text-xs text-ocean-700">
              <div>• Succès : 4242 4242 4242 4242</div>
              <div>• Refusé : 4000 0000 0000 0002</div>
              <div className="mt-2">Date : toute date future | CVV : tout 3 chiffres</div>
            </div>
          </div>
        </Card>

        {/* Card Number */}
        <div>
          <label className="block mb-2 text-gray-700">Numéro de carte</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className="w-full h-12 px-4 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              style={{ width: '100%' }}
              required
            />
          </div>
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-700">Date d'expiration</label>
            <input
              type="text"
              value={expiryDate}
              onChange={handleExpiryChange}
              placeholder="MM/AA"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              style={{ width: '100%' }}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-700">CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              style={{ width: '100%' }}
              required
            />
          </div>
        </div>

        {/* Card Name */}
        <div>
          <label className="block mb-2 text-gray-700">Nom du titulaire</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="NOM PRENOM"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent uppercase"
            style={{ width: '100%' }}
            required
          />
        </div>

        {/* Security Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <Check className="text-green-600 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="mb-1">Vos informations sont sécurisées</div>
              <div className="text-xs text-gray-600">
                Nous utilisons le cryptage SSL et ne stockons pas vos données bancaires.
                Le paiement est traité par Stripe, leader mondial du paiement en ligne.
              </div>
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-ocean-50 rounded-lg p-4 border border-ocean-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Montant total</span>
            <span className="text-ocean-900">{amount.toFixed(2)} €</span>
          </div>
          <div className="text-xs text-gray-600">
            Le paiement sera débité immédiatement
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onCancel}
            disabled={processing}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement...</span>
              </div>
            ) : (
              <>
                <Lock size={18} />
                Payer {amount.toFixed(2)} €
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <Lock size={14} />
          <span>SSL Sécurisé</span>
        </div>
        <div>•</div>
        <div>Powered by Stripe</div>
        <div>•</div>
        <div>Garantie remboursement</div>
      </div>
    </div>
  );
}
