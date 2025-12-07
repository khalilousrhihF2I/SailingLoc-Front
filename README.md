# SailingLoc - Plateforme de location de bateaux entre particuliers

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ et npm

### Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configuration des variables d'environnement**
Le fichier `.env` est déjà configuré avec les valeurs par défaut :
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_MODE=development
VITE_ENABLE_LOGGING=true
```

Si vous avez besoin de modifier ces valeurs, vous pouvez créer un fichier `.env.local` qui écrasera les valeurs du `.env`.

3. **Lancer l'application en mode développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run type-check` - Vérifie les types TypeScript

## 🔧 Configuration du mode API

L'application utilise un système de services configurable permettant de choisir entre :
- **Mode Mock** : Données factices pour le développement sans backend
- **Mode API** : Connexion à l'API .NET 8 réelle

### Configuration dans `config/apiMode.ts`

```typescript
export const apiConfig: ApiConfiguration = {
  defaultMode: 'mock', // 'mock' ou 'api'
  apiBaseUrl: 'http://localhost:5000/api',
  
  // Configuration par service
  services: {
    boats: 'mock',      // Change to 'api' when API is ready
    users: 'mock',
    bookings: 'mock',
    destinations: 'mock',
    reviews: 'mock',
    auth: 'mock',
    availability: 'mock',
  },
};
```

Vous pouvez activer l'API service par service au fur et à mesure du développement du backend.

## 📁 Structure du projet

```
/
├── components/         # Composants React réutilisables
├── config/            # Configuration (apiMode, etc.)
├── data/              # Données mock et types
├── lib/               # Bibliothèques et utilities
├── pages/             # Pages de l'application
│   ├── public/        # Front-office public
│   ├── dashboard/     # Espaces utilisateurs
│   └── admin/         # Back-office admin
├── services/          # Services API (mock + real)
├── styles/            # Styles globaux
└── App.tsx            # Point d'entrée principal
```

## 🎨 Design System

L'application utilise une palette nautique :
- Bleu océan profond (#0A2463)
- Turquoise (#00B4D8)
- Blanc écume (#FFFFFF)
- Orange corail (#FF6B35)

## 🔐 Architecture multi-rôles

- **Locataires** : Recherche et réservation de bateaux
- **Propriétaires** : Gestion d'annonces et calendrier
- **Administrateurs** : Back-office complet

## 📦 Technologies

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icônes)
- Recharts (graphiques)
- React Hook Form (formulaires)
- Date-fns (manipulation de dates)

## 🚢 API .NET 8

Pour connecter l'application à l'API .NET 8 :

1. Assurez-vous que l'API est lancée (généralement sur `http://localhost:5000`)
2. Vérifiez l'URL dans `.env` : `VITE_API_BASE_URL=http://localhost:5000/api`
3. Modifiez `config/apiMode.ts` pour activer les services souhaités
4. Redémarrez l'application React

## 📝 Licence

Propriétaire - SailingLoc
