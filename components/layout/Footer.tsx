
import { Anchor, Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { Page } from '../../types/navigation';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-ocean-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-turquoise-500 rounded-lg flex items-center justify-center">
                <Anchor size={24} />
              </div>
              <span className="text-xl">SailingLoc</span>
            </div>
            <p className="text-ocean-200 text-sm">
              La plateforme de location de bateaux entre particuliers.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4 className="mb-4 text-white">Découvrir</h4>
            <ul className="space-y-2 text-sm  mt-2">
              <li>
                <button onClick={() => onNavigate('search')} className="text-ocean-200 hover:text-white transition-colors">
                  Rechercher un bateau
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('destinations')} className="text-ocean-200 hover:text-white transition-colors">
                  Destinations populaires
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="text-ocean-200 hover:text-white transition-colors">
                  Comment ça marche
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="text-ocean-200 hover:text-white transition-colors">
                  Proposer son bateau
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-sm  mt-2">
              <li>
                <button onClick={() => onNavigate('faq')} className="text-ocean-200 hover:text-white transition-colors">
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="text-ocean-200 hover:text-white transition-colors">
                  Nous contacter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="text-ocean-200 hover:text-white transition-colors">
                  Conditions générales
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="text-ocean-200 hover:text-white transition-colors">
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="text-ocean-200 hover:text-white transition-colors">
                  Mentions légales
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-white">Newsletter</h4>
            <p className="text-ocean-200 text-sm mb-4">
              Recevez nos meilleures offres
            </p>
            <div className="flex gap-2  mt-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-3 py-2 rounded-lg bg-ocean-800 border border-ocean-700 text-white placeholder-ocean-300 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
              />
              <button className="px-4 py-2 bg-turquoise-500 rounded-lg hover:bg-turquoise-600 transition-colors">
                <Mail size={20} />
              </button>
            </div>
            
            {/* Social */}
            <div className="flex gap-3 mt-6">
              <button className="w-10 h-10 bg-ocean-800 rounded-lg flex items-center justify-center hover:bg-ocean-700 transition-colors">
                <Facebook size={20} />
              </button>
              <button className="w-10 h-10 bg-ocean-800 rounded-lg flex items-center justify-center hover:bg-ocean-700 transition-colors">
                <Instagram size={20} />
              </button>
              <button className="w-10 h-10 bg-ocean-800 rounded-lg flex items-center justify-center hover:bg-ocean-700 transition-colors">
                <Twitter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-ocean-800 text-center text-sm text-ocean-300">
          <p>© 2025 SailingLoc By Khalil Ousrhir. Tous droits réservés. <br />SailingLoc est un projet étudiant fictif — aucune réservation ni transaction réelle ne peut être effectuée via ce site.</p>
        </div>
      </div>
    </footer>
  );
}
