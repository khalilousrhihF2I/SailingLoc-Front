import  { useState } from 'react';
import { Anchor, Menu, X, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Page } from '../../types/navigation';

interface HeaderProps {
  isLoggedIn?: boolean;
  userType?: 'renter' | 'owner' | 'admin' | null;
  onNavigate: (page: Page) => void;
}

export function Header({ isLoggedIn = false, userType = null, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-ocean-600 rounded-lg flex items-center justify-center">
              <Anchor className="text-white" size={24} />
            </div>
            <span className="text-xl text-ocean-900 hidden sm:block">SailingLoc</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('search')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Rechercher un bateau
            </button>
            <button 
              onClick={() => onNavigate('destinations')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Destinations
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              À propos
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('login')}
                  className="hidden sm:inline-flex"
                >
                  Connexion
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onNavigate('register')}
                >
                  Créer un compte
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (userType === 'owner') onNavigate('owner-dashboard');
                    else if (userType === 'admin') onNavigate('admin-dashboard');
                    else onNavigate('renter-dashboard');
                  }}
                  className="hidden sm:inline-flex"
                >
                  <User size={18} />
                  Mon compte
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-ocean-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { onNavigate('search'); setMobileMenuOpen(false); }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                Rechercher un bateau
              </button>
              <button 
                onClick={() => { onNavigate('destinations'); setMobileMenuOpen(false); }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                Destinations
              </button>
              <button 
                onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                À propos
              </button>
              {!isLoggedIn ? (
                <>
                  <button 
                    onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                    className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
                  >
                    Connexion
                  </button>
                  <button 
                    onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                    className="text-left px-4 py-2 text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    if (userType === 'owner') onNavigate('owner-dashboard');
                    else if (userType === 'admin') onNavigate('admin-dashboard');
                    else onNavigate('renter-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                  Mon compte
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
