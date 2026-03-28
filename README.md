# SailingLoc — Frontend

Application SPA React 18 + TypeScript pour la plateforme de location de bateaux SailingLoc.

## Démarrage Rapide

### Prérequis

- Node.js 18+ et npm

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Prévisualisation build |
| `npm run lint` | Vérification ESLint |
| `npm run type-check` | Vérification TypeScript |

### Configuration API

Le fichier `config/apiMode.ts` permet de basculer entre mode Mock (données simulées) et mode API (backend .NET 8).

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Documentation Complète

La documentation technique complète est disponible dans le **[Wiki SailingLoc-Front](../SailingLoc-Front.wiki/Home.md)** :

- [Architecture Frontend](../SailingLoc-Front.wiki/Frontend/Architecture.md)
- [Composants](../SailingLoc-Front.wiki/Frontend/Components.md)
- [Gestion d'État](../SailingLoc-Front.wiki/Frontend/State-Management.md)
- [Routing](../SailingLoc-Front.wiki/Frontend/Routing.md)
- [Intégration API](../SailingLoc-Front.wiki/Frontend/API-Integration.md)
- [Patterns UI/UX](../SailingLoc-Front.wiki/Frontend/UI-UX-Patterns.md)

## Licence

Propriétaire - SailingLoc
