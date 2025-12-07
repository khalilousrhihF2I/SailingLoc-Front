
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Anchor, Shield, Users, Award, TrendingUp, Heart, Linkedin, Mail } from 'lucide-react';
import { Page } from '../types/navigation';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <Anchor className="text-white" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl mb-6">À propos de SailingLoc</h1>
            <p className="text-lg md:text-xl text-ocean-100 px-4">
              La première plateforme française de location de bateaux entre particuliers.
              Notre mission : rendre la navigation accessible à tous.
            </p>
          </div>
        </div>
      </div>

      {/* Notre Histoire */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-gray-900 mb-6">Notre Histoire</h2>
              <p className="text-gray-600 mb-4">
                Fondée en 2023, SailingLoc est née d'une passion commune pour la mer et d'une volonté 
                de démocratiser l'accès à la navigation. Nous avons créé une plateforme de confiance 
                où propriétaires et locataires se rencontrent pour vivre des expériences nautiques 
                inoubliables.
              </p>
              <p className="text-gray-600 mb-4">
                Notre plateforme garantit sécurité, confiance et simplicité pour tous. Chaque bateau 
                est vérifié, chaque propriétaire est validé, et chaque réservation est protégée par 
                une assurance complète.
              </p>
              <p className="text-gray-600">
                Aujourd'hui, nous mettons en relation des milliers de passionnés de la mer dans les 
                plus belles destinations nautiques d'Europe et des Caraïbes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center">
                <div className="text-4xl text-ocean-600 mb-2">300+</div>
                <div className="text-gray-600">Bateaux disponibles</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl text-ocean-600 mb-2">7</div>
                <div className="text-gray-600">Destinations phares</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl text-ocean-600 mb-2">10k+</div>
                <div className="text-gray-600">Utilisateurs</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl text-ocean-600 mb-2">95%</div>
                <div className="text-gray-600">Satisfaction client</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-gray-600 mb-4">
              Des principes qui guident chacune de nos actions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-100 rounded-full mb-6">
                <Shield className="text-ocean-600" size={32} />
              </div>
              <h3 className="text-gray-900 mb-3">Confiance</h3>
              <p className="text-gray-600">
                Vérification systématique des bateaux et des utilisateurs pour garantir la sécurité de tous.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-turquoise-100 rounded-full mb-6">
                <Users className="text-turquoise-600" size={32} />
              </div>
              <h3 className="text-gray-900 mb-3">Communauté</h3>
              <p className="text-gray-600">
                Une communauté de passionnés qui partagent leur amour de la mer et de la navigation.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <Award className="text-orange-500" size={32} />
              </div>
              <h3 className="text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                Des standards de qualité élevés pour offrir les meilleures expériences nautiques.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-100 rounded-full mb-6">
                <Heart className="text-ocean-600" size={32} />
              </div>
              <h3 className="text-gray-900 mb-3">Passion</h3>
              <p className="text-gray-600">
                L'amour de la mer au cœur de tout ce que nous faisons, chaque jour.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Notre Équipe - CEO */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Notre Fondateur</h2>
            <p className="text-gray-600 mb-4">
              Une vision entrepreneuriale au service de la navigation
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Photo/Avatar */}
                <div className="flex justify-center md:justify-start">
                  <div className="relative">
                    <div className="w-40 h-40 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-full flex items-center justify-center text-white text-5xl shadow-xl">
                      KO
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
                      CEO
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="md:col-span-2 text-center md:text-left">
                  <h3 className="text-gray-900 mb-2">Khalil Ousrhir</h3>
                  <div className="text-ocean-600 mb-4">
                    Fondateur & CEO de SailingLoc
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Award className="text-ocean-600 mt-1 shrink-0" size={20} />
                      <div>
                        <div className="text-gray-900">Formation</div>
                        <div className="text-gray-600">
                          Étudiant en 4ème année à l'École DSP - Institut F2I
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="text-ocean-600 mt-1 shrink-0" size={20} />
                      <div>
                        <div className="text-gray-900">Vision</div>
                        <div className="text-gray-600">
                          Révolutionner le secteur de la location nautique en combinant technologie et passion de la mer
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Anchor className="text-ocean-600 mt-1 shrink-0" size={20} />
                      <div>
                        <div className="text-gray-900">Mission</div>
                        <div className="text-gray-600">
                          Rendre la navigation accessible à tous et créer une communauté de passionnés autour de valeurs de confiance et de partage
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center md:justify-start">
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin size={18} />
                      LinkedIn
                    </a>
                    <button
                      onClick={() => onNavigate('contact')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
                    >
                      <Mail size={18} />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Notre Impact */}
      <section className="py-16 bg-gradient-to-br from-ocean-50 to-turquoise-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Notre Impact</h2>
            <p className="text-gray-600 mb-4">
              Des chiffres qui parlent d'eux-mêmes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl text-ocean-600 mb-2">300+</div>
              <div className="text-gray-900 mb-1">Bateaux</div>
              <div className="text-gray-600 text-sm">Disponibles à la location</div>
            </div>
            <div className="text-center">
              <div className="text-5xl text-ocean-600 mb-2">10k+</div>
              <div className="text-gray-900 mb-1">Utilisateurs</div>
              <div className="text-gray-600 text-sm">Font confiance à SailingLoc</div>
            </div>
            <div className="text-center">
              <div className="text-5xl text-ocean-600 mb-2">7</div>
              <div className="text-gray-900 mb-1">Destinations</div>
              <div className="text-gray-600 text-sm">Dans toute l'Europe</div>
            </div>
            <div className="text-center">
              <div className="text-5xl text-ocean-600 mb-2">95%</div>
              <div className="text-gray-900 mb-1">Satisfaction</div>
              <div className="text-gray-600 text-sm">De nos utilisateurs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 bg-linear-to-br from-ocean-600 to-ocean-800 text-white text-center">
            <h2 className="text-white mb-6">Rejoignez l'aventure SailingLoc</h2>
            <p className="text-white-600 mb-4">
              Que vous soyez locataire à la recherche de nouvelles expériences nautiques 
              ou propriétaire souhaitant partager votre passion, SailingLoc est fait pour vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
              <Button
                variant="ghost"
                onClick={() => onNavigate('search')}
                className="bg-white text-ocean-600 hover:bg-gray-100"
              >
                Rechercher un bateau
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('register')}
                className="bg-orange-500 text-white hover:bg-orange-600 border-none"
              >
                Devenir propriétaire
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-gray-900 mb-4">Une question ?</h2>
          <p className="text-gray-600 mb-8">
            Notre équipe est à votre écoute pour répondre à toutes vos questions 
            et vous accompagner dans votre expérience SailingLoc.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <Button
              variant="primary"
              onClick={() => onNavigate('contact')}
            >
              Nous contacter
            </Button>
            <Button
              variant="ghost"
              onClick={() => onNavigate('faq')}
            >
              Consulter la FAQ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
