import { Page } from '../types/navigation';
import { Card } from '@/components/ui/Card';

interface Props {
    navigate: (page: Page) => void;
}

export default function LegalPage({ navigate }: Props) {
    return (
        <main className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Mentions légales</h2>
            <Card className="p-8">
                <div className=" p-4">
                    <section className="mb-4">
                        <h3 className="text-lg font-medium">Présentation du site</h3>
                        <p className="mt-2 text-sm text-gray-700">
                            Ce site, nommé "SailingLoc", a été développé dans le cadre d'un projet étudiant réalisé par Khalil Ousrhir à l'Institut F2I. Il s'agit d'une maquette fonctionnelle destinée à démontrer des compétences techniques et UX.
                        </p>
                    </section>

                    <section className="mb-4">
                        <h3 className="text-lg font-medium">Nature fictive du service</h3>
                        <p className="mt-2 text-sm text-gray-700">
                            IMPORTANT : Ce service est entièrement fictif. Aucune réservation, aucun achat et aucune transaction financière réels ne peuvent être effectués via ce site. Toutes les annonces, disponibilités et paiements affichés sont simulés à des fins de démonstration et d'évaluation pédagogique.
                        </p>
                    </section>

                    <section className="mb-4">
                        <h3 className="text-lg font-medium">Responsabilité</h3>
                        <p className="mt-2 text-sm text-gray-700">
                            Les informations présentées sur ce site sont fournies à titre indicatif uniquement. L'auteur décline toute responsabilité pour l'utilisation qui pourrait être faite des informations et contenus présentés.
                        </p>
                    </section>

                    <section className="mb-4">
                        <h3 className="text-lg font-medium">Contact</h3>
                        <p className="mt-2 text-sm text-gray-700">
                            Pour toute question relative à ce projet, veuillez contacter l'auteur via la page Nous contacter.
                        </p>
                    </section>

                </div>
            </Card>


            <div className="mt-6">
                <button onClick={() => navigate('home')} className="px-4 py-2 bg-turquoise-500 rounded-lg text-white">
                    Retour à l'accueil
                </button>
            </div>
        </main>
    );
}

