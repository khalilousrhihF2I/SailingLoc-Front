import { useState, useEffect } from 'react';
import { Routes, Route, useParams, useSearchParams, useLocation, Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CookieBanner } from './components/layout/CookieBanner';
import ModalProvider from './components/ui/ModalProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useAppNavigate } from './hooks/useAppNavigate';
import { SEOHead, getOrganizationJsonLd, getWebSiteJsonLd } from './components/seo/SEOHead';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { BoatDetailPage } from './pages/BoatDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RenterDashboard } from './pages/RenterDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import AdminUserPage from './pages/AdminUserPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import { BookingFlow } from './pages/BookingFlow';
import { FAQPage, ContactPage, TermsPage, PrivacyPage, NotFoundPage } from './pages/SecondaryPages';
import { DestinationsPage } from './pages/DestinationsPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { OwnerBookingDetailPage } from './pages/OwnerBookingDetailPage';
import { authService, bookingService } from './services/ServiceFactory';
import { CreateBoatListingPage } from './pages/CreateBoatListingPage';
import { EditBoatListingPage } from './pages/EditBoatListingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import LegalPage from './pages/LegalPage';
import { getUserRole } from './utils/getUserRole';

// ── Layout with Header/Footer ──
function AppLayout() {
  const navigate = useAppNavigate();
  const { isLoggedIn, userType } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ocean-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Aller au contenu principal
      </a>
      <Header isLoggedIn={isLoggedIn} userType={userType} onNavigate={navigate} />
      <Breadcrumbs />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer onNavigate={navigate} />
      <CookieBanner />
    </div>
  );
}

// ── Route wrapper components ──
function HomeRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead
        title="SailingLoc"
        description="Louez un bateau entre particuliers partout en France. Voiliers, catamarans, bateaux à moteur – trouvez le bateau idéal pour vos vacances."
        canonical="https://sailingloc-front.azurestaticapps.net/"
        jsonLd={{
          ...getOrganizationJsonLd(),
          ...getWebSiteJsonLd(),
        }}
      />
      <HomePage onNavigate={navigate} />
    </>
  );
}

function SearchRoute() {
  const navigate = useAppNavigate();
  const [searchParams] = useSearchParams();
  const initialFilters: Record<string, string> = {};
  searchParams.forEach((value, key) => { initialFilters[key] = value; });
  const location = initialFilters['location'] || '';
  return (
    <>
      <SEOHead
        title={location ? `Bateaux à ${location}` : 'Recherche de bateaux'}
        description={location ? `Trouvez et louez un bateau à ${location}. Comparez les offres de voiliers, catamarans et bateaux à moteur.` : 'Recherchez parmi des centaines de bateaux à louer en France. Filtrez par type, prix, et destination.'}
        canonical="https://sailingloc-front.azurestaticapps.net/bateaux"
      />
      <SearchPage onNavigate={navigate} initialFilters={initialFilters} />
    </>
  );
}

function BoatDetailRoute() {
  const navigate = useAppNavigate();
  const { boatId } = useParams();
  return (
    <>
      <SEOHead
        title={`Bateau #${boatId}`}
        description={`Détails et réservation du bateau #${boatId} sur SailingLoc.`}
        canonical={`https://sailingloc-front.azurestaticapps.net/bateaux/${boatId}`}
        ogType="product"
      />
      <BoatDetailPage boatId={Number(boatId) || 0} onNavigate={navigate} />
    </>
  );
}

function LoginRoute() {
  const navigate = useAppNavigate();
  const { handleLogin } = useAuth();
  const location = useLocation();
  const pageData = location.state || {};

  const onLogin = (type: 'renter' | 'owner' | 'admin') => {
    handleLogin(type);
    if (type === 'admin') navigate('admin-dashboard');
    else if (type === 'owner') navigate('owner-dashboard');
    else navigate('renter-dashboard');
  };

  return (
    <>
      <SEOHead title="Connexion" description="Connectez-vous à votre compte SailingLoc pour gérer vos réservations et vos bateaux." noindex />
      <LoginPage onLogin={onLogin} onNavigate={navigate} pageData={pageData} />
    </>
  );
}

function RegisterRoute() {
  const navigate = useAppNavigate();
  const { handleRegister } = useAuth();

  const onRegister = (type: 'renter' | 'owner') => {
    handleRegister(type);
    if (type === 'owner') navigate('owner-dashboard');
    else navigate('renter-dashboard');
  };

  return (
    <>
      <SEOHead title="Inscription" description="Créez votre compte SailingLoc pour louer ou proposer des bateaux en France." noindex />
      <RegisterPage onRegister={onRegister} onNavigate={navigate} />
    </>
  );
}

function ForgotPasswordRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead title="Mot de passe oublié" description="Réinitialisez votre mot de passe SailingLoc." noindex />
      <ForgotPasswordPage onNavigate={navigate} />
    </>
  );
}

function RenterDashboardRoute() {
  const navigate = useAppNavigate();
  const { handleLogout } = useAuth();
  const onLogout = () => { handleLogout(); navigate('home'); };
  return (
    <>
      <SEOHead title="Tableau de bord locataire" description="Gérez vos réservations et vos bateaux favoris." noindex />
      <RenterDashboard onNavigate={navigate} onLogout={onLogout} />
    </>
  );
}

function OwnerDashboardRoute() {
  const navigate = useAppNavigate();
  const { handleLogout } = useAuth();
  const onLogout = () => { handleLogout(); navigate('home'); };
  return (
    <>
      <SEOHead title="Tableau de bord propriétaire" description="Gérez vos annonces et réservations de bateaux." noindex />
      <OwnerDashboard onNavigate={navigate} onLogout={onLogout} />
    </>
  );
}

function AdminDashboardRoute() {
  const navigate = useAppNavigate();
  const { handleLogout } = useAuth();
  const onLogout = () => { handleLogout(); navigate('home'); };
  return (
    <>
      <SEOHead title="Administration" description="Panneau d'administration SailingLoc." noindex />
      <AdminDashboard onLogout={onLogout} onNavigate={navigate} />
    </>
  );
}

function AdminUserRoute() {
  const navigate = useAppNavigate();
  const location = useLocation();
  const pageData = location.state || {};
  return <AdminUserPage pageData={pageData} onNavigate={navigate} />;
}

function AdminUserDetailRoute() {
  const { userId } = useParams();
  const location = useLocation();
  const pageData = { ...location.state, userId };
  return <AdminUserDetailPage pageData={pageData} />;
}

function BookingFlowRoute() {
  const navigate = useAppNavigate();
  const { boatId } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, handleAccountCreatedDuringBooking } = useAuth();
  return (
    <>
      <SEOHead title="Réservation" description="Réservez votre bateau sur SailingLoc." noindex />
      <BookingFlow
        boatId={Number(boatId) || 0}
        startDate={searchParams.get('startDate') || ''}
        endDate={searchParams.get('endDate') || ''}
        isLoggedIn={isLoggedIn}
        onNavigate={navigate}
        onAccountCreated={handleAccountCreatedDuringBooking}
      />
    </>
  );
}

function BookingConfirmationRoute() {
  const navigate = useAppNavigate();
  const location = useLocation();
  const bookingData = location.state || {};
  return (
    <>
      <SEOHead title="Confirmation de réservation" description="Votre réservation est confirmée." noindex />
      <BookingConfirmationPage bookingData={bookingData} onNavigate={navigate} />
    </>
  );
}

function BookingDetailRoute() {
  const navigate = useAppNavigate();
  const { bookingId } = useParams();
  return <BookingDetailRouter bookingId={bookingId || ''} onNavigate={navigate} />;
}

function DestinationsRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead
        title="Destinations"
        description="Découvrez les plus belles destinations de navigation en France : Côte d'Azur, Bretagne, Corse, Atlantique et plus encore."
        canonical="https://sailingloc-front.azurestaticapps.net/destinations"
      />
      <DestinationsPage onNavigate={navigate} />
    </>
  );
}

function AboutRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead
        title="À propos"
        description="Découvrez SailingLoc, la plateforme de location de bateaux entre particuliers. Notre mission, notre équipe et nos valeurs."
        canonical="https://sailingloc-front.azurestaticapps.net/a-propos"
      />
      <AboutPage onNavigate={navigate} />
    </>
  );
}

function HowItWorksRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead
        title="Comment ça marche"
        description="Découvrez comment louer ou proposer un bateau sur SailingLoc en quelques étapes simples."
        canonical="https://sailingloc-front.azurestaticapps.net/comment-ca-marche"
      />
      <HowItWorksPage onNavigate={navigate} />
    </>
  );
}

function FAQRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead
        title="FAQ"
        description="Questions fréquentes sur la location de bateaux avec SailingLoc : réservation, annulation, assurance, paiement."
        canonical="https://sailingloc-front.azurestaticapps.net/faq"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [],
        }}
      />
      <FAQPage onNavigate={navigate} />
    </>
  );
}

function ContactRoute() {
  return (
    <>
      <SEOHead
        title="Contact"
        description="Contactez l'équipe SailingLoc pour toute question sur la location de bateaux."
        canonical="https://sailingloc-front.azurestaticapps.net/contact"
      />
      <ContactPage />
    </>
  );
}

function TermsRoute() {
  return (
    <>
      <SEOHead
        title="Conditions générales"
        description="Conditions générales d'utilisation de la plateforme SailingLoc."
        canonical="https://sailingloc-front.azurestaticapps.net/conditions-generales"
      />
      <TermsPage />
    </>
  );
}

function PrivacyRoute() {
  return (
    <>
      <SEOHead
        title="Politique de confidentialité"
        description="Politique de confidentialité et protection des données personnelles de SailingLoc."
        canonical="https://sailingloc-front.azurestaticapps.net/politique-de-confidentialite"
      />
      <PrivacyPage />
    </>
  );
}

function LegalRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead
        title="Mentions légales"
        description="Mentions légales de SailingLoc, éditeur, hébergement et informations juridiques."
        canonical="https://sailingloc-front.azurestaticapps.net/mentions-legales"
      />
      <LegalPage navigate={navigate} />
    </>
  );
}

function CreateListingRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead title="Créer une annonce" description="Publiez votre bateau sur SailingLoc." noindex />
      <CreateBoatListingPage onNavigate={navigate} ownerId="1" />
    </>
  );
}

function EditListingRoute() {
  const navigate = useAppNavigate();
  const { boatId } = useParams();
  const location = useLocation();
  const pageData = location.state || {};
  return <EditBoatListingPage onNavigate={navigate} boatId={Number(boatId) || 0} pageData={pageData} />;
}

function NotFoundRoute() {
  const navigate = useAppNavigate();
  return (
    <>
      <SEOHead title="Page non trouvée" description="La page demandée n'existe pas." noindex />
      <NotFoundPage onNavigate={navigate} />
    </>
  );
}

// ── Main App with Routes ──
export default function App() {
  return (
    <ModalProvider>
      <Routes>
        {/* Standard pages with header/footer */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/bateaux" element={<SearchRoute />} />
          <Route path="/bateaux/:boatId" element={<BoatDetailRoute />} />
          <Route path="/connexion" element={<LoginRoute />} />
          <Route path="/inscription" element={<RegisterRoute />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordRoute />} />
          <Route path="/destinations" element={<DestinationsRoute />} />
          <Route path="/a-propos" element={<AboutRoute />} />
          <Route path="/comment-ca-marche" element={<HowItWorksRoute />} />
          <Route path="/faq" element={<FAQRoute />} />
          <Route path="/contact" element={<ContactRoute />} />
          <Route path="/conditions-generales" element={<TermsRoute />} />
          <Route path="/politique-de-confidentialite" element={<PrivacyRoute />} />
          <Route path="/mentions-legales" element={<LegalRoute />} />

          {/* Protected routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardRoute /></ProtectedRoute>} />
          <Route path="/admin/utilisateurs" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserRoute /></ProtectedRoute>} />
          <Route path="/admin/utilisateurs/:userId" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserDetailRoute /></ProtectedRoute>} />
          <Route path="/tableau-de-bord/locataire" element={<ProtectedRoute allowedRoles={['renter']}><RenterDashboardRoute /></ProtectedRoute>} />
          <Route path="/tableau-de-bord/proprietaire" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboardRoute /></ProtectedRoute>} />
          <Route path="/reservation/:boatId" element={<ProtectedRoute><BookingFlowRoute /></ProtectedRoute>} />
          <Route path="/reservation/confirmation" element={<ProtectedRoute><BookingConfirmationRoute /></ProtectedRoute>} />
          <Route path="/reservations/:bookingId" element={<ProtectedRoute><BookingDetailRoute /></ProtectedRoute>} />
          <Route path="/proprietaire/nouveau-bateau" element={<ProtectedRoute allowedRoles={['owner']}><CreateListingRoute /></ProtectedRoute>} />
          <Route path="/proprietaire/modifier-bateau/:boatId" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><EditListingRoute /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundRoute />} />
        </Route>
      </Routes>
    </ModalProvider>
  );
}

// ── Booking detail router (owner vs renter view) ──
// Chooses which detail page to render based on the current user's *actual* relation
// to the booking, not just their primary role. This allows an Owner who has rented
// another boat (or even their own) to see the renter view for that specific booking.
function BookingDetailRouter({ bookingId, onNavigate }: { bookingId: string; onNavigate: (p: any, d?: any) => void }) {
  const [view, setView] = useState<'owner' | 'renter' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [user, booking] = await Promise.all([
          authService.getCurrentUser(),
          bookingService.getBookingById(bookingId).catch(() => null),
        ]);
        if (!mounted) return;
        const userId = user ? String((user as any).id ?? '') : '';
        const renterId = booking ? String((booking as any).renterId ?? (booking as any).RenterId ?? '') : '';
        const ownerId = booking ? String((booking as any).ownerId ?? (booking as any).OwnerId ?? '') : '';
        const role = user ? getUserRole(user) : null;

        // 1. If this user is the renter of the booking, show renter view
        //    (handles an Owner who booked another owner's — or their own — boat).
        // 2. Otherwise, if this user is the owner of the booking, show owner view.
        // 3. Fallback to the user's primary role.
        if (userId && renterId && userId === renterId) setView('renter');
        else if (userId && ownerId && userId === ownerId) setView('owner');
        else if (role === 'owner') setView('owner');
        else setView('renter');
      } catch {
        if (mounted) setView('renter');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [bookingId]);

  if (loading) return <div className="p-6" role="status" aria-live="polite">Chargement...</div>;
  if (view === 'owner') return <OwnerBookingDetailPage bookingId={bookingId} onNavigate={onNavigate} />;
  return <BookingDetailPage bookingId={bookingId} onNavigate={onNavigate} />;
}
