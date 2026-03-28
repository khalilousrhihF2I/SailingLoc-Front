import { Page } from '../types/navigation';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, AlertTriangle, Shield, Mail } from 'lucide-react';

interface Props {
    navigate: (page: Page) => void;
}

export default function LegalPage({ navigate }: Props) {
    const sections = [
        {
            title: 'Présentation du site',
            icon: FileText,
            content: 'Ce site, nommé "SailingLoc", a été développé dans le cadre d\'un projet étudiant réalisé par Khalil Ousrhir à l\'Institut F2I. Il s\'agit d\'une maquette fonctionnelle destinée à démontrer des compétences techniques et UX.',
            bullets: [
                'Nom du projet : SailingLoc — Plateforme de location de bateaux entre particuliers',
                'Auteur : Khalil Ousrhir',
                'Établissement : Institut F2I',
                'Hébergement : Projet étudiant (environnement de démonstration)',
            ]
        },
        {
            title: 'Nature fictive du service',
            icon: AlertTriangle,
            variant: 'warning' as const,
            content: 'Ce service est entièrement fictif. Aucune réservation, aucun achat et aucune transaction financière réels ne peuvent être effectués via ce site. Toutes les annonces, disponibilités et paiements affichés sont simulés à des fins de démonstration et d\'évaluation pédagogique.',
            bullets: [
                'Les bateaux affichés n\'existent pas réellement',
                'Les paiements sont simulés et aucune somme n\'est prélevée',
                'Les comptes utilisateurs sont créés à titre de démonstration',
                'Les données collectées ne sont utilisées qu\'à des fins pédagogiques',
            ]
        },
        {
            title: 'Responsabilité',
            icon: Shield,
            content: 'Les informations présentées sur ce site sont fournies à titre indicatif uniquement. L\'auteur décline toute responsabilité pour l\'utilisation qui pourrait être faite des informations et contenus présentés.',
            bullets: [
                'Ce site ne constitue pas une offre commerciale',
                'L\'auteur ne saurait être tenu responsable des erreurs ou omissions dans le contenu',
                'Les liens éventuels vers des sites tiers n\'engagent pas la responsabilité de l\'auteur',
            ]
        },
        {
            title: 'Contact',
            icon: Mail,
            content: 'Pour toute question relative à ce projet, vous pouvez contacter l\'auteur via la page dédiée.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <FileText className="text-ocean-600" size={32} />
                    </div>
                    <h2 className="text-gray-900 mb-3">Mentions légales</h2>
                    <p className="text-gray-500">Informations légales relatives au site SailingLoc</p>
                </div>

                <div className="space-y-6">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        const isWarning = (section as any).variant === 'warning';
                        return (
                            <Card
                                key={idx}
                                className={`p-8 animate-fade-in-up stagger-${Math.min(idx + 1, 6)} ${
                                    isWarning ? 'border-orange-200 bg-orange-50/50' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`w-10 h-10 ${isWarning ? 'bg-orange-100' : 'bg-ocean-100'} rounded-lg flex items-center justify-center shrink-0`}>
                                        <Icon className={isWarning ? 'text-orange-600' : 'text-ocean-600'} size={20} />
                                    </div>
                                    <h3 className="text-gray-900">{section.title}</h3>
                                </div>
                                <p className={`leading-relaxed mb-4 ml-14 ${isWarning ? 'text-orange-800 font-medium' : 'text-gray-600'}`}>
                                    {section.content}
                                </p>
                                {section.bullets && (
                                    <ul className="space-y-2 ml-14">
                                        {section.bullets.map((bullet, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-600">
                                                <span className={`w-1.5 h-1.5 ${isWarning ? 'bg-orange-400' : 'bg-ocean-400'} rounded-full mt-2 shrink-0`} />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-10 flex justify-center gap-4 animate-fade-in-up stagger-5">
                    <Button variant="primary" onClick={() => navigate('home')}>
                        Retour à l'accueil
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('contact')}>
                        Nous contacter
                    </Button>
                </div>
            </div>
        </div>
    );
}
