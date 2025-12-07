#!/usr/bin/env node

/**
 * Script de vérification de l'environnement
 * 
 * Vérifie que toutes les variables d'environnement nécessaires sont définies
 * et que la configuration est correcte.
 * 
 * Usage: node scripts/check-env.js
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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function fileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

function readEnvFile(filePath) {
  try {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) return null;
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const vars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return vars;
  } catch (error) {
    return null;
  }
}

// Variables d'environnement requises
const requiredVars = [
  {
    name: 'VITE_API_BASE_URL',
    description: 'URL de base de l\'API .NET 8',
    default: 'http://localhost:5000/api',
  },
  {
    name: 'VITE_APP_MODE',
    description: 'Mode de l\'application',
    default: 'development',
  },
  {
    name: 'VITE_ENABLE_LOGGING',
    description: 'Activer les logs de debug',
    default: 'true',
  },
];

// Fichiers importants
const importantFiles = [
  '.env',
  'vite-env.d.ts',
  'config/apiMode.ts',
  'vite.config.ts',
  'package.json',
  'tsconfig.json',
];

function checkFiles() {
  logSection('📁 Vérification des fichiers');
  
  let allFilesExist = true;
  
  importantFiles.forEach(file => {
    if (fileExists(file)) {
      logSuccess(`${file} existe`);
    } else {
      logError(`${file} manquant`);
      allFilesExist = false;
    }
  });
  
  // Vérification de .env.local
  if (fileExists('.env.local')) {
    logWarning('.env.local existe (écrase les valeurs de .env)');
  }
  
  // Vérification de .gitignore
  if (fileExists('.gitignore')) {
    const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');
    if (gitignoreContent.includes('.env.local')) {
      logSuccess('.gitignore inclut .env.local');
    } else {
      logWarning('.gitignore devrait inclure .env.local');
    }
  }
  
  return allFilesExist;
}

function checkEnvVariables() {
  logSection('🔑 Vérification des variables d\'environnement');
  
  const envVars = readEnvFile('.env');
  const envLocalVars = readEnvFile('.env.local');
  
  if (!envVars) {
    logError('Impossible de lire le fichier .env');
    return false;
  }
  
  logSuccess(`Fichier .env trouvé avec ${Object.keys(envVars).length} variable(s)`);
  
  if (envLocalVars) {
    logWarning(`Fichier .env.local trouvé avec ${Object.keys(envLocalVars).length} variable(s)`);
  }
  
  let allVarsPresent = true;
  
  requiredVars.forEach(({ name, description, default: defaultValue }) => {
    const value = envLocalVars?.[name] || envVars[name];
    
    if (value) {
      logSuccess(`${name} = ${value}`);
      log(`   → ${description}`, 'blue');
    } else {
      logError(`${name} manquant`);
      log(`   → ${description}`, 'blue');
      log(`   → Valeur par défaut recommandée: ${defaultValue}`, 'yellow');
      allVarsPresent = false;
    }
  });
  
  // Vérifier les variables non préfixées par VITE_
  const allVars = { ...envVars, ...envLocalVars };
  const nonViteVars = Object.keys(allVars).filter(key => !key.startsWith('VITE_'));
  
  if (nonViteVars.length > 0) {
    logWarning('Variables sans préfixe VITE_ (non accessibles dans le code) :');
    nonViteVars.forEach(key => {
      log(`   → ${key}`, 'yellow');
    });
  }
  
  return allVarsPresent;
}

function checkApiConfig() {
  logSection('⚙️  Vérification de la configuration API');
  
  const apiConfigPath = path.join(rootDir, 'config/apiMode.ts');
  
  if (!fs.existsSync(apiConfigPath)) {
    logError('config/apiMode.ts introuvable');
    return false;
  }
  
  const content = fs.readFileSync(apiConfigPath, 'utf-8');
  
  // Vérifier la présence de la fonction getEnvVar
  if (content.includes('function getEnvVar')) {
    logSuccess('Fonction getEnvVar présente (gestion sécurisée des env vars)');
  } else {
    logWarning('Fonction getEnvVar manquante');
  }
  
  // Vérifier le mode par défaut
  const defaultModeMatch = content.match(/defaultMode:\s*['"](\w+)['"]/);
  if (defaultModeMatch) {
    const mode = defaultModeMatch[1];
    logSuccess(`Mode par défaut: ${mode}`);
    
    if (mode === 'mock') {
      log('   → L\'application utilisera les données Mock', 'blue');
    } else if (mode === 'api') {
      log('   → L\'application utilisera l\'API réelle', 'blue');
      logWarning('   → Assurez-vous que l\'API .NET 8 est démarrée');
    }
  }
  
  return true;
}

function checkPackageJson() {
  logSection('📦 Vérification de package.json');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json introuvable');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Vérifier les scripts
  const requiredScripts = ['dev', 'build', 'preview'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      logSuccess(`Script "${script}" présent`);
    } else {
      logError(`Script "${script}" manquant`);
    }
  });
  
  // Vérifier les dépendances importantes
  const requiredDeps = ['react', 'react-dom', 'vite'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      logSuccess(`Dépendance "${dep}" présente`);
    } else {
      logError(`Dépendance "${dep}" manquante`);
    }
  });
  
  return true;
}

function printSummary(checks) {
  logSection('📊 Résumé');
  
  const allPassed = Object.values(checks).every(v => v);
  
  if (allPassed) {
    logSuccess('✓ Tous les tests sont passés !');
    log('\n🚀 Vous pouvez démarrer l\'application avec :', 'green');
    log('   npm install', 'cyan');
    log('   npm run dev', 'cyan');
  } else {
    logError('✗ Certains tests ont échoué');
    log('\n📚 Consultez les fichiers suivants pour plus d\'informations :', 'yellow');
    log('   - QUICKSTART.md', 'cyan');
    log('   - TROUBLESHOOTING.md', 'cyan');
    log('   - ENV.md', 'cyan');
  }
  
  console.log('\n');
}

// Exécution principale
function main() {
  log('\n🔍 Vérification de l\'environnement SailingLoc\n', 'cyan');
  
  const checks = {
    files: checkFiles(),
    env: checkEnvVariables(),
    apiConfig: checkApiConfig(),
    package: checkPackageJson(),
  };
  
  printSummary(checks);
}

main();
