import  { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Page } from '../../types/navigation';

interface HeaderProps {
  isLoggedIn?: boolean;
  userType?: 'renter' | 'owner' | 'admin' | null;
  onNavigate: (page: Page) => void;
}

export function Header({ isLoggedIn = false, userType = null, onNavigate: _onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const dashboardPath = userType === 'owner' ? '/tableau-de-bord/proprietaire'
    : userType === 'admin' ? '/admin'
    : '/tableau-de-bord/locataire';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="SailingLoc - Accueil"
          >
            <img src="/logos/logo-icon-only.PNG" alt="" className="w-10 h-9 rounded-lg object-contain" aria-hidden="true" />
            <img src="/logos/logo-text-only.PNG" alt="" className="h-4 rounded-lg object-contain" aria-hidden="true" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
            <Link
              to="/bateaux"
              className="text-gray-700 hover:text-ocean-600 transition-colors"
              aria-current={location.pathname === '/bateaux' ? 'page' : undefined}
            >
              Rechercher un bateau
            </Link>
            <Link
              to="/destinations"
              className="text-gray-700 hover:text-ocean-600 transition-colors"
              aria-current={location.pathname === '/destinations' ? 'page' : undefined}
            >
              Destinations
            </Link>
            <Link
              to="/a-propos"
              className="text-gray-700 hover:text-ocean-600 transition-colors"
              aria-current={location.pathname === '/a-propos' ? 'page' : undefined}
            >
              À propos
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link to="/connexion" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" tabIndex={-1}>
                    Connexion
                  </Button>
                </Link>
                <Link to="/inscription">
                  <Button variant="primary" size="sm" tabIndex={-1}>
                    Créer un compte
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to={dashboardPath} className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm" tabIndex={-1}>
                    <User size={18} aria-hidden="true" />
                    Mon compte
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-ocean-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden py-4 border-t border-gray-200" aria-label="Menu mobile">
            <div className="flex flex-col gap-3">
              <Link
                to="/bateaux"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                Rechercher un bateau
              </Link>
              <Link
                to="/destinations"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                Destinations
              </Link>
              <Link
                to="/a-propos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                À propos
              </Link>
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/connexion"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left px-4 py-2 text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                  >
                    Créer un compte
                  </Link>
                </>
              ) : (
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                  Mon compte
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
