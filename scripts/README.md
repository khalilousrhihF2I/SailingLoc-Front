# 🛠️ Scripts utilitaires - SailingLoc

Ce dossier contient des scripts Node.js utilitaires pour faciliter le développement et la maintenance de SailingLoc.

---

## 📜 Scripts disponibles

### check-env.js

**Description** : Vérifie que l'environnement de développement est correctement configuré.

**Usage** :
```bash
npm run check-env
# ou
node scripts/check-env.js
```

**Ce qu'il vérifie** :
- ✅ Présence des fichiers essentiels (`.env`, `vite-env.d.ts`, etc.)
- ✅ Variables d'environnement requises
- ✅ Configuration de `config/apiMode.ts`
- ✅ Scripts npm dans `package.json`
- ✅ Dépendances importantes

**Exemple de sortie** :
```
🔍 Vérification de l'environnement SailingLoc

============================================================
📁 Vérification des fichiers
============================================================
✓ .env existe
✓ vite-env.d.ts existe
✓ config/apiMode.ts existe
✓ vite.config.ts existe
✓ package.json existe
✓ tsconfig.json existe

============================================================
🔑 Vérification des variables d'environnement
============================================================
✓ Fichier .env trouvé avec 3 variable(s)
✓ VITE_API_BASE_URL = http://localhost:5000/api
   → URL de base de l'API .NET 8
✓ VITE_APP_MODE = development
   → Mode de l'application
✓ VITE_ENABLE_LOGGING = true
   → Activer les logs de debug

============================================================
⚙️  Vérification de la configuration API
============================================================
✓ Fonction getEnvVar présente (gestion sécurisée des env vars)
✓ Mode par défaut: mock
   → L'application utilisera les données Mock

============================================================
📦 Vérification de package.json
============================================================
✓ Script "dev" présent
✓ Script "build" présent
✓ Script "preview" présent
✓ Dépendance "react" présente
✓ Dépendance "react-dom" présente
✓ Dépendance "vite" présente

============================================================
📊 Résumé
============================================================
✓ Tous les tests sont passés !

🚀 Vous pouvez démarrer l'application avec :
   npm install
   npm run dev
```

**Quand l'utiliser** :
- Avant de démarrer l'application pour la première fois
- Après avoir cloné le projet
- En cas de problème de configuration
- Avant de déployer
- Après avoir modifié les fichiers `.env`

---

## 🔧 Créer un nouveau script

### Structure recommandée

```javascript
#!/usr/bin/env node

/**
 * Description du script
 * 
 * Usage: node scripts/mon-script.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Logique du script
function main() {
  log('🔍 Mon script utilitaire', 'cyan');
  // ...
}

main();
```

### Ajouter le script à package.json

```json
{
  "scripts": {
    "mon-script": "node scripts/mon-script.js"
  }
}
```

### Rendre le script exécutable (Unix/Mac)

```bash
chmod +x scripts/mon-script.js
./scripts/mon-script.js
```

---

## 💡 Idées de scripts utilitaires

### Scripts de vérification
- ✅ `check-env.js` (déjà créé)
- 🔜 `check-api.js` - Vérifie que l'API .NET 8 est accessible
- 🔜 `check-dependencies.js` - Vérifie les dépendances obsolètes

### Scripts de génération
- 🔜 `generate-component.js` - Génère un nouveau composant React
- 🔜 `generate-service.js` - Génère un nouveau service API/Mock
- 🔜 `generate-page.js` - Génère une nouvelle page

### Scripts de maintenance
- 🔜 `clean.js` - Nettoie les fichiers temporaires et caches
- 🔜 `update-deps.js` - Met à jour les dépendances
- 🔜 `format.js` - Formate le code (Prettier)

### Scripts de déploiement
- 🔜 `build-prod.js` - Build optimisé pour la production
- 🔜 `analyze-bundle.js` - Analyse la taille du bundle
- 🔜 `pre-deploy.js` - Vérifications avant déploiement

---

## 📝 Bonnes pratiques

### Utilisation des couleurs
```javascript
function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}
```

### Gestion des erreurs
```javascript
try {
  // Opération risquée
  const data = fs.readFileSync('fichier.json', 'utf-8');
  const json = JSON.parse(data);
} catch (error) {
  logError(`Erreur : ${error.message}`);
  process.exit(1);
}
```

### Arguments en ligne de commande
```javascript
const args = process.argv.slice(2);
const command = args[0];
const options = args.slice(1);

if (command === 'help') {
  console.log('Usage: node script.js [command] [options]');
  process.exit(0);
}
```

### Confirmation utilisateur
```javascript
import readline from 'readline';

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question(`${question} (y/n) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Usage
const confirmed = await confirm('Continuer ?');
if (!confirmed) {
  console.log('Annulé.');
  process.exit(0);
}
```

---

## 🚀 Utilisation avancée

### Passer des arguments
```bash
# Avec npm
npm run check-env -- --verbose

# Directement avec node
node scripts/check-env.js --verbose
```

### Chaîner plusieurs scripts
```bash
npm run check-env && npm run dev
```

### Utiliser dans les hooks Git
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run check-env",
      "pre-push": "npm run lint && npm run build"
    }
  }
}
```

---

## 📚 Ressources

- **Node.js fs** : https://nodejs.org/api/fs.html
- **Node.js path** : https://nodejs.org/api/path.html
- **Node.js process** : https://nodejs.org/api/process.html
- **ANSI colors** : https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

---

## 🤝 Contribution

Pour ajouter un nouveau script :

1. Créer le fichier dans `/scripts/`
2. Ajouter le shebang : `#!/usr/bin/env node`
3. Documenter l'usage dans ce README
4. Ajouter le script dans `package.json`
5. Tester le script : `node scripts/nouveau-script.js`

---

**Les scripts utilitaires facilitent le développement ! 🛠️**

*Navigation : [Haut de page](#️-scripts-utilitaires---sailingloc) | [Scripts disponibles](#-scripts-disponibles) | [Créer un nouveau script](#-créer-un-nouveau-script)*
