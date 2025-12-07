
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Phone, MapPin, HelpCircle } from 'lucide-react';
import { Page } from '../types/navigation';
import { useState } from 'react';
import { messageService } from '../services/ServiceFactory';

interface SecondaryPageProps {
  onNavigate: (page: Page, data?: any) => void;
}

export function FAQPage({ onNavigate }: SecondaryPageProps) {
  const faqs = [
    {
      question: 'Comment réserver un bateau sur SailingLoc ?',
      answer: 'Recherchez un bateau, sélectionnez vos dates, puis suivez le processus de réservation en 3 étapes simples.'
    },
    {
      question: 'Quelle est la politique d\'annulation ?',
      answer: 'Annulation gratuite jusqu\'à 7 jours avant la date de départ. Au-delà, des frais d\'annulation peuvent s\'appliquer.'
    },
    {
      question: 'Dois-je avoir un permis bateau ?',
      answer: 'Cela dépend du type de bateau et de sa puissance. Les voiliers nécessitent généralement un permis côtier ou hauturier.'
    },
    {
      question: 'L\'assurance est-elle incluse ?',
      answer: 'Oui, tous nos bateaux sont couverts par une assurance complète incluse dans le prix de location.'
    },
    {
      question: 'Comment devenir propriétaire sur SailingLoc ?',
      answer: 'Inscrivez-vous en tant que propriétaire, ajoutez votre bateau avec photos et description, et commencez à recevoir des réservations.'
    },
    {
      question: 'Quels sont les frais de service ?',
      answer: 'SailingLoc prélève 10% de frais de service sur chaque réservation pour couvrir l\'assurance et la plateforme.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-ocean-600" size={32} />
          </div>
          <h2 className="text-gray-900 mb-4">Questions fréquentes</h2>
          <p className="text-gray-600 text-lg">Trouvez les réponses aux questions les plus courantes</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h4 className="text-gray-900 mb-3">{faq.question}</h4>
              <p className="text-gray-600">{faq.answer}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Vous ne trouvez pas la réponse à votre question ?</p>
          <Button variant="primary" onClick={() => onNavigate('contact')}>
            Nous contacter
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  // pageData may be passed via navigation, attempt to read prefill
  const pageData = (typeof window !== 'undefined' && (() => {
    try { const raw = sessionStorage.getItem('sailingloc_current_page_data'); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  })()) || {};
  const prefill = pageData?.prefill || {};

  const [name, setName] = useState(prefill?.name || '');
  const [email, setEmail] = useState(prefill?.email || '');
  const [subject, setSubject] = useState(prefill?.subject || '');
  const [message, setMessage] = useState(prefill?.message || (`Référence réservation: ${prefill?.reference ?? ''}`));
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!name || !email || !subject || !message) {
      setStatusMessage('Veuillez remplir tous les champs.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatusMessage('Email invalide.');
      return;
    }
    if (!messageService) {
      setStatusMessage('Messagerie non disponible (mode mock).');
      return;
    }

    setSending(true);
    try {
      const dto = { name, email, subject, message };
      const resp = await messageService.contact(dto);
      if (!resp.success) {
        setStatusMessage(resp.message || 'Erreur envoi message');
      } else {
        setStatusMessage(resp.message || 'Message envoyé.');
        // Reset form values to initial prefill (stay on the page)
        setName(prefill?.name || '');
        setEmail(prefill?.email || '');
        setSubject(prefill?.subject || '');
        setMessage(prefill?.message || (`Référence réservation: ${prefill?.reference ?? ''}`));
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Erreur inconnue');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">Nous contacter</h2>
          <p className="text-gray-600 text-lg">Notre équipe est là pour vous aider</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="p-8">
            <h3 className="text-gray-900 mb-6">Envoyez-nous un message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input label="Nom complet" placeholder="Jean Dupont" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Sujet" placeholder="Ma question concerne..." value={subject} onChange={(e) => setSubject(e.target.value)} />
              <div>
                <label className="block mb-2 text-gray-700">Message</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  placeholder="Décrivez votre demande..."
                />
              </div>
              {statusMessage && <div className="text-sm text-green-600">{statusMessage}</div>}
              <Button variant="primary" fullWidth type="submit" disabled={sending}>{sending ? 'Envoi...' : 'Envoyer'}</Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ocean-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="text-ocean-600" size={24} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-2">Email</h4>
                  <p className="text-gray-600">contact@sailingloc.com</p>
                  <p className="text-sm text-gray-500 mt-1">Réponse sous 24h</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-turquoise-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="text-turquoise-600" size={24} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-2">Téléphone</h4>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                  <p className="text-sm text-gray-500 mt-1">Lun-Ven 9h-18h</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="text-orange-600" size={24} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-2">Adresse</h4>
                  <p className="text-gray-600">123 Quai des Navigateurs</p>
                  <p className="text-gray-600">17000 La Rochelle, France</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-gray-900 mb-8">Conditions Générales d'Utilisation</h2>
        
        <Card className="p-8">
          <div className="prose prose-ocean max-w-none">
            <h3 className="text-gray-900 mb-4">1. Objet</h3>
            <p className="text-gray-600 mb-6">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme SailingLoc,
              qui met en relation des propriétaires de bateaux avec des locataires.
            </p>

            <h3 className="text-gray-900 mb-4">2. Inscription</h3>
            <p className="text-gray-600 mb-6">
              L'inscription sur la plateforme est gratuite. Les utilisateurs doivent fournir des informations exactes et
              à jour. Chaque utilisateur est responsable de la confidentialité de ses identifiants.
            </p>

            <h3 className="text-gray-900 mb-4">3. Location de bateaux</h3>
            <p className="text-gray-600 mb-6">
              Les propriétaires s'engagent à fournir des bateaux en bon état et conformes aux normes de sécurité. Les
              locataires doivent respecter le bateau et les conditions d'utilisation définies par le propriétaire.
            </p>

            <h3 className="text-gray-900 mb-4">4. Paiement et frais</h3>
            <p className="text-gray-600 mb-6">
              SailingLoc prélève une commission de 10% sur chaque transaction. Les paiements sont sécurisés et traités
              via notre partenaire Stripe.
            </p>

            <h3 className="text-gray-900 mb-4">5. Annulation</h3>
            <p className="text-gray-600 mb-6">
              L'annulation gratuite est possible jusqu'à 7 jours avant la date de départ. Au-delà, des frais
              d'annulation de 50% s'appliquent.
            </p>

            <h3 className="text-gray-900 mb-4">6. Responsabilité</h3>
            <p className="text-gray-600 mb-6">
              SailingLoc agit en tant qu'intermédiaire et ne peut être tenue responsable des dommages survenus lors de
              la location. Une assurance complète est incluse dans chaque réservation.
            </p>

            <h3 className="text-gray-900 mb-4">7. Données personnelles</h3>
            <p className="text-gray-600 mb-6">
              Vos données personnelles sont traitées conformément à notre Politique de Confidentialité et au RGPD.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-gray-900 mb-8">Politique de Confidentialité</h2>
        
        <Card className="p-8">
          <div className="prose prose-ocean max-w-none">
            <h3 className="text-gray-900 mb-4">1. Collecte des données</h3>
            <p className="text-gray-600 mb-6">
              SailingLoc collecte les données nécessaires au fonctionnement de la plateforme : nom, email, téléphone,
              informations de paiement, documents d'identité et permis bateau.
            </p>

            <h3 className="text-gray-900 mb-4">2. Utilisation des données</h3>
            <p className="text-gray-600 mb-6">
              Vos données sont utilisées uniquement pour faciliter les réservations, assurer la sécurité de la
              plateforme et améliorer nos services.
            </p>

            <h3 className="text-gray-900 mb-4">3. Protection des données</h3>
            <p className="text-gray-600 mb-6">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès,
              modification, divulgation ou destruction non autorisés.
            </p>

            <h3 className="text-gray-900 mb-4">4. Partage des données</h3>
            <p className="text-gray-600 mb-6">
              Vos données ne sont partagées qu'avec les parties nécessaires à la réalisation de la location
              (propriétaire/locataire) et nos partenaires de paiement sécurisé.
            </p>

            <h3 className="text-gray-900 mb-4">5. Vos droits</h3>
            <p className="text-gray-600 mb-6">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité
              de vos données personnelles.
            </p>

            <h3 className="text-gray-900 mb-4">6. Cookies</h3>
            <p className="text-gray-600 mb-6">
              Notre site utilise des cookies pour améliorer votre expérience utilisateur. Vous pouvez les désactiver
              dans les paramètres de votre navigateur.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function NotFoundPage({ onNavigate }: SecondaryPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-gray-900 mb-4">404</h1>
        <h3 className="text-gray-900 mb-4">Page non trouvée</h3>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button variant="primary" onClick={() => onNavigate('home')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
