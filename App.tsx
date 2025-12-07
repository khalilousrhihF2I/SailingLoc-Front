import  { useState, useEffect } from 'react';
import { Page } from './types/navigation';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ModalProvider from './components/ui/ModalProvider';
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
import { authService } from './services/ServiceFactory';
import { CreateBoatListingPage } from './pages/CreateBoatListingPage';
import { EditBoatListingPage } from './pages/EditBoatListingPage';
import { AboutPage } from './pages/AboutPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import LegalPage from './pages/LegalPage';

// Use shared Page type from `types/navigation`

type UserType = 'renter' | 'owner' | 'admin' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<any>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  // Try to restore auth on app mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { authService } = await import('./services/ServiceFactory');
        const authenticated = await authService.isAuthenticated();
        if (!mounted) return;
        if (authenticated) {
          const user = await authService.getCurrentUser();
          if (!mounted) return;
          if (user) {
            setIsLoggedIn(true);
            const { getUserRole } = await import('./utils/getUserRole');
            const inferred = getUserRole(user);
            setUserType(inferred);
            // Restore previous page from sessionStorage when possible
            try {
              const saved = sessionStorage.getItem('sailingloc_current_page');
              const savedData = sessionStorage.getItem('sailingloc_current_page_data');
              if (saved) {
                const p = saved as Page;
                setCurrentPage(p);
                if (savedData) setPageData(JSON.parse(savedData));
              } else {
                // Fallback: go to role dashboard
                if (inferred === 'admin') setCurrentPage('admin-dashboard');
                else if (inferred === 'owner') setCurrentPage('owner-dashboard');
                else setCurrentPage('renter-dashboard');
              }
            } catch (e) {
              if (inferred === 'admin') setCurrentPage('admin-dashboard');
              else if (inferred === 'owner') setCurrentPage('owner-dashboard');
              else setCurrentPage('renter-dashboard');
            }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const navigate = (page: Page, data?: any) => {
    setCurrentPage(page);
    setPageData(data || {});
    try {
      sessionStorage.setItem('sailingloc_current_page', page);
      sessionStorage.setItem('sailingloc_current_page_data', JSON.stringify(data || {}));
    } catch (e) {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (type: UserType) => {
    setIsLoggedIn(true);
    setUserType(type);
    
    if (type === 'admin') {
      navigate('admin-dashboard');
    } else if (type === 'owner') {
      navigate('owner-dashboard');
    } else {
      navigate('renter-dashboard');
    }
  };

  const handleRegister = (type: 'renter' | 'owner') => {
    setIsLoggedIn(true);
    setUserType(type);
    
    if (type === 'owner') {
      navigate('owner-dashboard');
    } else {
      navigate('renter-dashboard');
    }
  };

  const handleAccountCreatedDuringBooking = () => {
    setIsLoggedIn(true);
    setUserType('renter');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    navigate('home');
  };

  // Pages that don't need header/footer
  const fullScreenPages: Page[] = ['admin-dashboard'];
  const showLayout = !fullScreenPages.includes(currentPage);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      
      case 'search':
        return <SearchPage onNavigate={navigate} initialFilters={pageData} />;
      
      case 'boat-detail':
        return <BoatDetailPage boatId={pageData.boatId} onNavigate={navigate} />;
      
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={navigate} pageData={pageData} />;
      
      case 'register':
        return <RegisterPage onRegister={handleRegister} onNavigate={navigate} />;

      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={navigate} />;

      case 'renter-dashboard':
        return <RenterDashboard onNavigate={navigate} onLogout={handleLogout} />;
      
      case 'owner-dashboard':
        return <OwnerDashboard onNavigate={navigate} onLogout={handleLogout} />;
      
      case 'admin-dashboard':
        return <AdminDashboard onLogout={handleLogout} onNavigate={navigate} />;
      case 'admin-user':
        // If a specific userId is provided, show dedicated detail page
        if (pageData && pageData.userId) {
          return <AdminUserDetailPage pageData={pageData} />;
        }
        return <AdminUserPage pageData={pageData} onNavigate={navigate} />;
      
      case 'booking-step1':
        return (
          <BookingFlow
            boatId={pageData.boatId}
            startDate={pageData.startDate}
            endDate={pageData.endDate}
            isLoggedIn={isLoggedIn}
            onNavigate={navigate}
            onAccountCreated={handleAccountCreatedDuringBooking}
          />
        );
      
      case 'booking-confirmation':
        return (
          <BookingConfirmationPage
            bookingData={pageData}
            onNavigate={navigate}
          />
        );
      
      case 'faq':
        return <FAQPage onNavigate={navigate} />;
      
      case 'contact':
        return <ContactPage />;
      
      case 'terms':
        return <TermsPage />;
      
      case 'privacy':
        return <PrivacyPage />;
      
      case 'about':
        return <AboutPage onNavigate={navigate} />;

      case 'legal':
        return <LegalPage navigate={navigate} />;
      
      case 'destinations':
        return <DestinationsPage onNavigate={navigate} />; 
        
      case 'create-listing':
        return (
          <CreateBoatListingPage
            onNavigate={navigate}
            ownerId="1"
          />
        );
      
      case 'edit-listing':
        return (
          <EditBoatListingPage
            onNavigate={navigate}
            boatId={pageData.boatId}
            pageData={pageData}
          />
        );
      
      case 'booking-detail':
        return (
          <BookingDetailRouter bookingId={pageData.bookingId} onNavigate={navigate} />
        );
      
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <ModalProvider>
    <div className="min-h-screen flex flex-col">
      {showLayout && (
        <Header 
          isLoggedIn={isLoggedIn} 
          userType={userType}
          onNavigate={navigate} 
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      {showLayout && <Footer onNavigate={navigate} />}
    </div>
    </ModalProvider>
  );
}

function BookingDetailRouter({ bookingId, onNavigate }: { bookingId: string; onNavigate: (p: Page, d?: any) => void }) {
  const [role, setRole] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!mounted) return;
        if (user) {
          const { getUserRole } = await import('./utils/getUserRole');
          setRole(getUserRole(user));
        }
      } catch { }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (role === 'owner') return <OwnerBookingDetailPage bookingId={bookingId} onNavigate={onNavigate} />;
  return <BookingDetailPage bookingId={bookingId} onNavigate={onNavigate} />;
}
