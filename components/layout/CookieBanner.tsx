import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '../ui/Button';

const COOKIE_CONSENT_KEY = 'sailingloc_cookie_consent';

type ConsentLevel = 'all' | 'essential' | null;

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept(level: ConsentLevel) {
    if (level) {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ level, date: new Date().toISOString() }));
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-ocean-100 rounded-full shrink-0">
            <Cookie className="text-ocean-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-900 font-semibold text-lg">Nous respectons votre vie privée</h3>
              <button onClick={() => accept('essential')} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              SailingLoc utilise des cookies pour assurer le bon fonctionnement du site, améliorer votre expérience
              et analyser le trafic. Conformément au RGPD, nous vous demandons votre consentement avant de déposer
              des cookies non essentiels.
            </p>

            {showDetails && (
              <div className="mb-4 space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Cookies essentiels (toujours actifs)</div>
                  <p className="text-gray-500">Nécessaires au fonctionnement du site : authentification, préférences de navigation, sécurité.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Cookies analytiques</div>
                  <p className="text-gray-500">Nous aident à comprendre comment vous utilisez le site afin de l'améliorer (trafic, pages populaires).</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Cookies marketing</div>
                  <p className="text-gray-500">Utilisés pour personnaliser les publicités et mesurer l'efficacité des campagnes.</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" onClick={() => accept('all')}>
                Tout accepter
              </Button>
              <Button variant="ghost" size="sm" onClick={() => accept('essential')}>
                Essentiels uniquement
              </Button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-ocean-600 hover:text-ocean-700 underline underline-offset-2"
              >
                {showDetails ? 'Masquer les détails' : 'Personnaliser'}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              En savoir plus dans notre{' '}
              <a href="/politique-de-confidentialite" className="underline hover:text-gray-600">politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
