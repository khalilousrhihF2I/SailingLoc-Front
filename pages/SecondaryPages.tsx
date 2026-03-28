import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Mail, Phone, MapPin, HelpCircle, ChevronDown, Anchor, CreditCard, Shield, UserCheck, Clock, FileText, Scale, Eye, Cookie, Lock, Database, Share2, Users } from 'lucide-react';
import { Page } from '../types/navigation';
import { useState } from 'react';
import { messageService } from '../services/ServiceFactory';

interface SecondaryPageProps {
  onNavigate: (page: Page, data?: any) => void;
}

/* ============================================================
   FAQ PAGE — with categorised accordion
   ============================================================ */

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-ocean-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-gray-900 font-medium pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-ocean-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-0 bg-white animate-fade-in">
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-600 leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function FAQPage({ onNavigate }: SecondaryPageProps) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('reservation');

  const categories = [
    { id: 'reservation', label: 'Réservation', icon: Anchor },
    { id: 'paiement', label: 'Paiement & Tarifs', icon: CreditCard },
    { id: 'securite', label: 'Sécurité & Assurance', icon: Shield },
    { id: 'proprietaire', label: 'Propriétaires', icon: UserCheck },
    { id: 'compte', label: 'Mon compte', icon: Users },
  ];

  const faqs: Record<string, { question: string; answer: string }[]> = {
    reservation: [
      {
        question: 'Comment réserver un bateau sur SailingLoc ?',
        answer: 'C\'est simple ! Recherchez un bateau par destination, type ou dates. Sélectionnez le bateau qui vous convient, choisissez vos dates de location, puis suivez le processus de réservation en 3 étapes : confirmation des dates, informations personnelles et paiement sécurisé.'
      },
      {
        question: 'Combien de temps à l\'avance dois-je réserver ?',
        answer: 'Nous recommandons de réserver au moins 2 semaines à l\'avance, surtout en haute saison (juin-septembre). Certaines locations peuvent être disponibles avec un préavis plus court selon la disponibilité du bateau.'
      },
      {
        question: 'Puis-je modifier les dates de ma réservation ?',
        answer: 'Oui, vous pouvez modifier vos dates depuis votre espace locataire, sous réserve de la disponibilité du bateau. Les modifications sont gratuites si elles sont effectuées au moins 7 jours avant la date de départ.'
      },
      {
        question: 'Quelle est la politique d\'annulation ?',
        answer: 'L\'annulation est gratuite jusqu\'à 7 jours avant la date de départ. Entre 7 et 3 jours avant le départ, des frais de 30% du montant total s\'appliquent. Moins de 3 jours avant le départ, les frais s\'élèvent à 50%. Aucun remboursement n\'est possible le jour du départ.'
      },
    ],
    paiement: [
      {
        question: 'Quels sont les moyens de paiement acceptés ?',
        answer: 'Nous acceptons les cartes bancaires Visa, Mastercard et American Express. Tous les paiements sont traités de manière sécurisée via notre partenaire Stripe. Les virements bancaires sont aussi acceptés pour les réservations supérieures à 1 000€.'
      },
      {
        question: 'Quels sont les frais de service ?',
        answer: 'SailingLoc prélève une commission de 10% sur chaque réservation. Ces frais couvrent l\'assurance de base, le service client, la maintenance de la plateforme et la garantie de paiement sécurisé.'
      },
      {
        question: 'Quand suis-je débité ?',
        answer: 'Le paiement intégral est effectué au moment de la confirmation de la réservation. Le propriétaire reçoit le versement 24 heures après le début de la location, une fois le bateau remis au locataire.'
      },
      {
        question: 'Existe-t-il une caution ?',
        answer: 'Oui, une caution peut être demandée par le propriétaire. Son montant varie selon le bateau (généralement entre 500€ et 3 000€). La caution est restituée dans les 7 jours suivant la fin de la location si aucun dommage n\'est constaté.'
      },
    ],
    securite: [
      {
        question: 'Dois-je avoir un permis bateau ?',
        answer: 'Cela dépend du type de bateau et de sa motorisation. Les bateaux à moteur de plus de 6 CV nécessitent un permis côtier. Les voiliers de plus de 6m requièrent un permis hauturier pour la navigation au large. Certains bateaux sans permis sont disponibles sur la plateforme.'
      },
      {
        question: 'L\'assurance est-elle incluse ?',
        answer: 'Oui, tous les bateaux listés sur SailingLoc sont couverts par une assurance responsabilité civile de base incluse dans le prix de location. Des options d\'assurance complémentaires (tous risques, annulation) sont disponibles lors de la réservation.'
      },
      {
        question: 'Que se passe-t-il en cas de panne ou d\'incident ?',
        answer: 'Contactez immédiatement notre service d\'urgence disponible 24h/24 au +33 1 23 45 67 89. Nous coordonnerons l\'assistance technique avec le propriétaire. En cas de panne rendant le bateau inutilisable, un remboursement au prorata est prévu.'
      },
    ],
    proprietaire: [
      {
        question: 'Comment devenir propriétaire sur SailingLoc ?',
        answer: 'Inscrivez-vous en tant que propriétaire, complétez votre profil et vos documents (pièce d\'identité, attestation d\'assurance du bateau). Créez ensuite votre annonce avec des photos de qualité, une description détaillée et vos tarifs. Notre équipe vérifie chaque annonce avant publication.'
      },
      {
        question: 'Combien puis-je gagner en louant mon bateau ?',
        answer: 'Vos revenus dépendent du type de bateau, de sa localisation et de la saison. En moyenne, un voilier de 10m en Méditerranée génère entre 3 000€ et 8 000€ par mois en haute saison. SailingLoc prélève 10% de commission sur chaque réservation.'
      },
      {
        question: 'Comment sont gérées les disponibilités ?',
        answer: 'Vous disposez d\'un calendrier interactif dans votre espace propriétaire pour gérer les disponibilités de votre bateau. Vous pouvez bloquer des dates, définir des tarifs saisonniers et des durées minimales de location.'
      },
    ],
    compte: [
      {
        question: 'Comment modifier mes informations personnelles ?',
        answer: 'Connectez-vous à votre espace (locataire ou propriétaire), puis accédez à l\'onglet "Mon profil". Vous pouvez y modifier vos coordonnées, votre adresse et votre photo de profil à tout moment.'
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Pour supprimer votre compte, contactez notre équipe via la page Contact. Veuillez noter que toute réservation en cours devra être finalisée ou annulée avant la suppression. Conformément au RGPD, vos données seront effacées dans un délai de 30 jours.'
      },
      {
        question: 'J\'ai oublié mon mot de passe, que faire ?',
        answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Saisissez votre adresse email et vous recevrez un lien de réinitialisation. Ce lien est valable 24 heures. Si vous ne recevez pas l\'email, vérifiez vos spams ou contactez le support.'
      },
    ],
  };

  const currentFaqs = faqs[activeCategory] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <HelpCircle className="text-ocean-600" size={32} />
          </div>
          <h2 className="text-gray-900 mb-3">Questions fréquentes</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur la location de bateaux, les paiements, l'assurance et bien plus.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in-up stagger-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenItem(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-ocean-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 animate-fade-in-up stagger-2">
          {currentFaqs.map((faq, index) => (
            <AccordionItem
              key={`${activeCategory}-${index}`}
              question={faq.question}
              answer={faq.answer}
              isOpen={openItem === `${activeCategory}-${index}`}
              onToggle={() => setOpenItem(openItem === `${activeCategory}-${index}` ? null : `${activeCategory}-${index}`)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center animate-fade-in-up stagger-3">
          <Card className="p-8 bg-gradient-to-r from-ocean-50 to-turquoise-50 border-0">
            <p className="text-gray-700 text-lg mb-2">Vous ne trouvez pas la réponse à votre question ?</p>
            <p className="text-gray-500 mb-6">Notre équipe est disponible pour vous aider du lundi au vendredi, de 9h à 18h.</p>
            <Button variant="primary" onClick={() => onNavigate('contact')}>
              Nous contacter
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONTACT PAGE — enhanced form with feedback
   ============================================================ */

export function ContactPage() {
  const pageData = (typeof window !== 'undefined' && (() => {
    try { const raw = sessionStorage.getItem('sailingloc_current_page_data'); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  })()) || {};
  const prefill = pageData?.prefill || {};

  const [name, setName] = useState(prefill?.name || '');
  const [email, setEmail] = useState(prefill?.email || '');
  const [subject, setSubject] = useState(prefill?.subject || '');
  const [message, setMessage] = useState(prefill?.message || (`Référence réservation: ${prefill?.reference ?? ''}`));
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  if (touched.name && !name.trim()) errors.name = 'Le nom est requis';
  if (touched.email && !email.trim()) errors.email = 'L\'email est requis';
  else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Adresse email invalide';
  if (touched.subject && !subject.trim()) errors.subject = 'Le sujet est requis';
  if (touched.message && !message.trim()) errors.message = 'Le message est requis';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setTouched({ name: true, email: true, subject: true, message: true });

    if (!name || !email || !subject || !message) {
      setStatusMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatusMessage({ type: 'error', text: 'Veuillez saisir une adresse email valide.' });
      return;
    }
    if (!messageService) {
      setStatusMessage({ type: 'error', text: 'Service de messagerie non disponible.' });
      return;
    }

    setSending(true);
    try {
      const dto = { name, email, subject, message };
      const resp = await messageService.contact(dto);
      if (!resp.success) {
        setStatusMessage({ type: 'error', text: resp.message || 'Une erreur est survenue lors de l\'envoi.' });
      } else {
        setStatusMessage({ type: 'success', text: 'Votre message a bien été envoyé ! Nous vous répondrons sous 24 heures.' });
        setName(prefill?.name || '');
        setEmail(prefill?.email || '');
        setSubject(prefill?.subject || '');
        setMessage(prefill?.message || (`Référence réservation: ${prefill?.reference ?? ''}`));
        setTouched({});
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Une erreur réseau est survenue. Veuillez réessayer.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-gray-900 mb-3">Nous contacter</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Une question, une suggestion ou besoin d'aide ? Notre équipe est à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3 animate-fade-in-up stagger-1">
            <Card className="p-8">
              <h3 className="text-gray-900 mb-6">Envoyez-nous un message</h3>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Nom complet"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    error={errors.email}
                    required
                  />
                </div>
                <Input
                  label="Sujet"
                  placeholder="Sélectionnez ou décrivez votre sujet"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, subject: true }))}
                  error={errors.subject}
                  required
                />
                <div>
                  <label className="block mb-2 text-gray-700">Message <span className="text-red-500">*</span></label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, message: true }))}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 transition-colors`}
                    placeholder="Décrivez votre demande en détail..."
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                {statusMessage && (
                  <Alert type={statusMessage.type}>{statusMessage.text}</Alert>
                )}

                <Button variant="primary" fullWidth type="submit" disabled={sending}>
                  {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4 animate-fade-in-up stagger-2">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="text-ocean-600" size={22} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1 font-semibold">Email</h4>
                  <p className="text-ocean-600 font-medium">contact@sailingloc.com</p>
                  <p className="text-sm text-gray-500 mt-1">Réponse sous 24h ouvrées</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-turquoise-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="text-turquoise-600" size={22} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1 font-semibold">Téléphone</h4>
                  <p className="text-turquoise-600 font-medium">+33 1 23 45 67 89</p>
                  <p className="text-sm text-gray-500 mt-1">Lun–Ven, 9h–18h</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="text-orange-600" size={22} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1 font-semibold">Adresse</h4>
                  <p className="text-gray-700">123 Quai des Navigateurs</p>
                  <p className="text-gray-700">17000 La Rochelle, France</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="text-green-600" size={22} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1 font-semibold">Horaires</h4>
                  <p className="text-gray-700">Lundi – Vendredi : 9h – 18h</p>
                  <p className="text-sm text-gray-500 mt-1">Urgences 24h/24 pour les locations en cours</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TERMS PAGE — Enriched CGU content
   ============================================================ */

export function TermsPage() {
  const sections = [
    {
      number: '1',
      title: 'Objet',
      icon: FileText,
      content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme SailingLoc, accessible à l'adresse sailingloc.com. La plateforme met en relation des propriétaires de bateaux avec des locataires souhaitant louer un bateau pour une durée déterminée.`,
      bullets: [
        'SailingLoc agit en tant qu\'intermédiaire technique entre propriétaires et locataires',
        'L\'utilisation de la plateforme implique l\'acceptation intégrale des présentes CGU',
        'SailingLoc se réserve le droit de modifier ces conditions à tout moment'
      ]
    },
    {
      number: '2',
      title: 'Inscription et compte utilisateur',
      icon: UserCheck,
      content: `L'inscription sur la plateforme est gratuite et ouverte à toute personne physique majeure. Les utilisateurs s'engagent à fournir des informations exactes, complètes et à jour.`,
      bullets: [
        'Chaque utilisateur est responsable de la confidentialité de ses identifiants',
        'Un compte ne peut être partagé avec un tiers',
        'SailingLoc peut suspendre ou supprimer un compte en cas de manquement aux CGU',
        'L\'utilisateur peut demander la suppression de son compte à tout moment'
      ]
    },
    {
      number: '3',
      title: 'Location de bateaux',
      icon: Anchor,
      content: `Les propriétaires s'engagent à fournir des bateaux en bon état de fonctionnement et conformes aux normes de sécurité maritime en vigueur. Les locataires doivent respecter les règles d'utilisation définies par le propriétaire.`,
      bullets: [
        'Le propriétaire garantit que le bateau est conforme à sa description',
        'Le locataire s\'engage à restituer le bateau dans l\'état où il l\'a reçu',
        'Un état des lieux est réalisé au départ et au retour de la location',
        'Le locataire doit posséder les permis et qualifications nécessaires'
      ]
    },
    {
      number: '4',
      title: 'Paiement et frais',
      icon: CreditCard,
      content: `Tous les paiements sont traités de manière sécurisée via notre partenaire Stripe. Le paiement est exigible au moment de la confirmation de la réservation.`,
      bullets: [
        'Commission SailingLoc : 10% du montant de la location',
        'Moyens de paiement acceptés : Visa, Mastercard, American Express',
        'Le propriétaire reçoit le versement 24h après le début de la location',
        'Une caution peut être demandée par le propriétaire (restituée sous 7 jours après la location)'
      ]
    },
    {
      number: '5',
      title: 'Politique d\'annulation',
      icon: Clock,
      content: `Les conditions d'annulation varient selon le délai avant la date de départ prévue :`,
      bullets: [
        'Plus de 7 jours avant le départ : annulation gratuite, remboursement intégral',
        'Entre 7 et 3 jours : frais d\'annulation de 30% du montant total',
        'Moins de 3 jours avant le départ : frais de 50% du montant total',
        'Jour du départ ou non-présentation : aucun remboursement'
      ]
    },
    {
      number: '6',
      title: 'Responsabilité',
      icon: Shield,
      content: `SailingLoc agit en tant qu'intermédiaire technique et ne peut être tenue responsable des dommages directs ou indirects survenus lors de la location.`,
      bullets: [
        'Une assurance responsabilité civile de base est incluse dans chaque réservation',
        'Des assurances complémentaires sont proposées (tous risques, annulation)',
        'Le propriétaire est responsable de l\'entretien et de la sécurité de son bateau',
        'Le locataire est responsable de tout dommage causé pendant la période de location'
      ]
    },
    {
      number: '7',
      title: 'Données personnelles',
      icon: Lock,
      content: `Vos données personnelles sont traitées conformément à notre Politique de Confidentialité et au Règlement Général sur la Protection des Données (RGPD). Nous ne collectons que les données nécessaires au bon fonctionnement du service.`,
      bullets: [
        'Droit d\'accès, de rectification et de suppression de vos données',
        'Droit à la portabilité de vos données',
        'Vos données ne sont jamais vendues à des tiers',
        'Durée de conservation : 3 ans après le dernier accès au compte'
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Scale className="text-ocean-600" size={32} />
          </div>
          <h2 className="text-gray-900 mb-3">Conditions Générales d'Utilisation</h2>
          <p className="text-gray-500">Dernière mise à jour : mars 2026</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={section.number} className={`p-8 animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="text-ocean-600" size={20} />
                  </div>
                  <h3 className="text-gray-900">{section.number}. {section.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 ml-14">{section.content}</p>
                {section.bullets && (
                  <ul className="space-y-2 ml-14">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full mt-2 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PRIVACY PAGE — Enriched privacy policy
   ============================================================ */

export function PrivacyPage() {
  const sections = [
    {
      number: '1',
      title: 'Collecte des données',
      icon: Database,
      content: 'SailingLoc collecte les données personnelles nécessaires au bon fonctionnement de la plateforme, dans le respect du Règlement Général sur la Protection des Données (RGPD).',
      bullets: [
        'Données d\'identité : nom, prénom, date de naissance',
        'Coordonnées : adresse email, numéro de téléphone, adresse postale',
        'Données de paiement : traitées exclusivement par notre partenaire Stripe (SailingLoc ne stocke jamais vos données bancaires)',
        'Documents : pièce d\'identité, permis bateau (stockés de manière chiffrée)',
        'Données de navigation : pages visitées, durée des sessions, appareil utilisé'
      ]
    },
    {
      number: '2',
      title: 'Utilisation des données',
      icon: Eye,
      content: 'Vos données sont utilisées exclusivement pour les finalités suivantes :',
      bullets: [
        'Création et gestion de votre compte utilisateur',
        'Facilitation des réservations et mise en relation propriétaire/locataire',
        'Traitement sécurisé des paiements',
        'Service client et résolution des litiges',
        'Amélioration continue de nos services et de l\'expérience utilisateur',
        'Communication d\'informations relatives à vos réservations (emails transactionnels)'
      ]
    },
    {
      number: '3',
      title: 'Protection des données',
      icon: Shield,
      content: 'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles.',
      bullets: [
        'Chiffrement des données sensibles en transit (TLS/SSL) et au repos',
        'Accès restreint aux données personnelles (besoin d\'en connaître)',
        'Authentification forte pour l\'accès aux systèmes internes',
        'Audits de sécurité réguliers',
        'Hébergement des données au sein de l\'Union Européenne'
      ]
    },
    {
      number: '4',
      title: 'Partage des données',
      icon: Share2,
      content: 'Vos données ne sont partagées qu\'avec les parties strictement nécessaires à la réalisation du service :',
      bullets: [
        'Propriétaire ou locataire dans le cadre d\'une réservation (données limitées au nécessaire)',
        'Stripe : traitement sécurisé des paiements',
        'Autorités compétentes en cas d\'obligation légale',
        'Vos données ne sont jamais vendues à des tiers à des fins commerciales'
      ]
    },
    {
      number: '5',
      title: 'Vos droits (RGPD)',
      icon: Users,
      content: 'Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :',
      bullets: [
        'Droit d\'accès : obtenir une copie de vos données personnelles',
        'Droit de rectification : corriger des données inexactes ou incomplètes',
        'Droit de suppression (« droit à l\'oubli ») : demander l\'effacement de vos données',
        'Droit à la portabilité : recevoir vos données dans un format structuré et lisible',
        'Droit d\'opposition : vous opposer au traitement de vos données pour des motifs légitimes',
        'Droit de limitation : demander la limitation du traitement de vos données',
        'Pour exercer vos droits : contact@sailingloc.com ou page Contact'
      ]
    },
    {
      number: '6',
      title: 'Cookies',
      icon: Cookie,
      content: 'Notre site utilise des cookies pour assurer son bon fonctionnement et améliorer votre expérience de navigation.',
      bullets: [
        'Cookies essentiels : authentification, sécurité, préférences de session',
        'Cookies analytiques : mesure d\'audience anonymisée pour améliorer nos services',
        'Aucun cookie publicitaire ou de traçage tiers',
        'Vous pouvez gérer vos préférences cookies dans les paramètres de votre navigateur',
        'La suppression des cookies essentiels peut impacter le fonctionnement du site'
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock className="text-ocean-600" size={32} />
          </div>
          <h2 className="text-gray-900 mb-3">Politique de Confidentialité</h2>
          <p className="text-gray-500">Dernière mise à jour : mars 2026</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={section.number} className={`p-8 animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="text-ocean-600" size={20} />
                  </div>
                  <h3 className="text-gray-900">{section.number}. {section.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 ml-14">{section.content}</p>
                {section.bullets && (
                  <ul className="space-y-2 ml-14">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full mt-2 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   404 PAGE
   ============================================================ */

export function NotFoundPage({ onNavigate }: SecondaryPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4">
      <div className="text-center animate-fade-in-up">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h3 className="text-gray-900 mb-4">Page non trouvée</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button variant="primary" onClick={() => onNavigate('home')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
