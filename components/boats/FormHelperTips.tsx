import  { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface FormHelperTipsProps {
  step: number;
}

export function FormHelperTips({ step }: FormHelperTipsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const tips = {
    1: {
      title: 'Conseils pour les informations de base',
      items: [
        'Choisissez un nom attractif et mémorable pour votre bateau',
        'Vérifiez que l\'année de construction est correcte',
        'Soyez précis sur la capacité maximale autorisée',
        'Indiquez le nombre exact de cabines disponibles pour les locataires'
      ]
    },
    2: {
      title: 'Conseils pour la localisation',
      items: [
        'Indiquez le nom exact du port ou de la marina',
        'Ajoutez des détails pour faciliter l\'accès (quai, ponton...)',
        'La destination aide les locataires à trouver votre annonce',
        'Soyez précis : les locataires apprécient les informations claires'
      ]
    },
    3: {
      title: 'Conseils pour le prix et la description',
      items: [
        'Consultez les prix d\'autres bateaux similaires dans votre région',
        'Une bonne description augmente vos réservations de 40%',
        'Mentionnez les points forts : équipements, confort, performances',
        'Précisez ce qui est inclus dans le prix (essence, skipper...)'
      ]
    },
    4: {
      title: 'Conseils pour les équipements',
      items: [
        'Plus vous listez d\'équipements, plus votre annonce sera attractive',
        'Les équipements de navigation et de confort sont très recherchés',
        'N\'oubliez pas les équipements de sécurité',
        'Les équipements de loisirs (paddle, matériel de plongée) sont un plus'
      ]
    },
    5: {
      title: 'Derniers conseils avant publication',
      items: [
        'Relisez attentivement toutes les informations',
        'Vérifiez que la photo principale est de bonne qualité',
        'Assurez-vous que le prix est compétitif',
        'Une fois publiée, votre annonce sera visible par des milliers de locataires'
      ]
    }
  };

  const currentTips = tips[step as keyof typeof tips];

  if (!currentTips || !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-ocean-600 text-white rounded-full shadow-lg hover:bg-ocean-700 transition-all flex items-center justify-center z-50"
      >
        <Lightbulb size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="p-4 bg-ocean-50 border-b border-ocean-100 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <Lightbulb size={20} className="text-ocean-600" />
          <h4 className="text-gray-900">{currentTips.title}</h4>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {currentTips.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-ocean-600 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Masquer les conseils
        </button>
      </div>
    </div>
  );
}
