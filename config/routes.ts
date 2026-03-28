import { Page } from '../types/navigation';

/**
 * Mapping between internal Page types and URL paths.
 * Route params use :param syntax.
 */
export const PAGE_TO_PATH: Record<Page, string> = {
  'home': '/',
  'search': '/bateaux',
  'boat-detail': '/bateaux/:boatId',
  'login': '/connexion',
  'register': '/inscription',
  'forgot-password': '/mot-de-passe-oublie',
  'renter-dashboard': '/tableau-de-bord/locataire',
  'owner-dashboard': '/tableau-de-bord/proprietaire',
  'admin-dashboard': '/admin',
  'admin-user': '/admin/utilisateurs',
  'booking-step1': '/reservation/:boatId',
  'booking-flow': '/reservation/:boatId',
  'booking-confirmation': '/reservation/confirmation',
  'booking-detail': '/reservations/:bookingId',
  'leave-review': '/avis',
  'destinations': '/destinations',
  'about': '/a-propos',
  'faq': '/faq',
  'contact': '/contact',
  'terms': '/conditions-generales',
  'privacy': '/politique-de-confidentialite',
  'legal': '/mentions-legales',
  'create-listing': '/proprietaire/nouveau-bateau',
  'edit-listing': '/proprietaire/modifier-bateau/:boatId',
  '404': '/404',
};

/**
 * Build a URL path from a Page and optional data.
 */
export function buildPath(page: Page, data?: Record<string, any>): string {
  let path = PAGE_TO_PATH[page] || '/404';

  if (data) {
    // Replace route params
    if (data.boatId != null) path = path.replace(':boatId', String(data.boatId));
    if (data.bookingId != null) path = path.replace(':bookingId', String(data.bookingId));
    if (data.userId != null) path = path + '/' + String(data.userId);
  }

  // Remove any unreplaced params
  path = path.replace(/\/:[^/]+/g, '');

  // Build query string for remaining data (excluding route param keys)
  const routeParamKeys = ['boatId', 'bookingId', 'userId'];
  if (data) {
    const queryParams = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (!routeParamKeys.includes(key) && value !== undefined && value !== null) {
        queryParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    const query = queryParams.toString();
    if (query) path += `?${query}`;
  }

  return path;
}
