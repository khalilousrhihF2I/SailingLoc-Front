import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbJsonLd } from '../seo/SEOHead';
import { Helmet } from 'react-helmet-async';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Accueil',
  'bateaux': 'Bateaux',
  'destinations': 'Destinations',
  'a-propos': 'À propos',
  'faq': 'FAQ',
  'contact': 'Contact',
  'conditions-generales': 'Conditions générales',
  'politique-de-confidentialite': 'Confidentialité',
  'mentions-legales': 'Mentions légales',
  'connexion': 'Connexion',
  'inscription': 'Inscription',
  'mot-de-passe-oublie': 'Mot de passe oublié',
  'reservation': 'Réservation',
  'reservations': 'Réservations',
  'confirmation': 'Confirmation',
  'tableau-de-bord': 'Tableau de bord',
  'locataire': 'Locataire',
  'proprietaire': 'Propriétaire',
  'nouveau-bateau': 'Nouveau bateau',
  'modifier-bateau': 'Modifier un bateau',
  'admin': 'Administration',
  'utilisateurs': 'Utilisateurs',
};

// Contextual labels for dynamic ID segments based on parent path
const DYNAMIC_SEGMENT_LABELS: Record<string, string> = {
  'bateaux': 'Détails du bateau',
  'reservation': 'Réserver',
  'reservations': 'Détails de la réservation',
  'utilisateurs': 'Détail utilisateur',
  'modifier-bateau': 'Modifier',
};

function isDynamicSegment(segment: string): boolean {
  // Numeric IDs, GUIDs, or long hex strings
  return /^\d+$/.test(segment) || /^[0-9a-f-]{8,}$/i.test(segment);
}

function getSegmentLabel(segment: string, prevSegment: string | undefined): string {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  if (isDynamicSegment(segment) && prevSegment && DYNAMIC_SEGMENT_LABELS[prevSegment]) {
    return DYNAMIC_SEGMENT_LABELS[prevSegment];
  }
  // Fallback: format slug-like segments nicely (replace hyphens, capitalize first letter)
  const decoded = decodeURIComponent(segment).replace(/-/g, ' ');
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

const SITE_URL = 'https://sailingloc-front.azurestaticapps.net';

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) return null;

  const crumbs = [
    { label: 'Accueil', path: '/' },
    ...pathSegments.map((segment, index) => ({
      label: getSegmentLabel(segment, index > 0 ? pathSegments[index - 1] : undefined),
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
    })),
  ];

  const jsonLdItems = crumbs.map((c) => ({
    name: c.label,
    url: `${SITE_URL}${c.path}`,
  }));

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbJsonLd(jsonLdItems))}
        </script>
      </Helmet>
      <nav aria-label="Fil d'Ariane" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast ? (
                  <span aria-current="page" className="text-gray-800 font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.path} className="hover:text-ocean-600 hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
