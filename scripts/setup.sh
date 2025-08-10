#!/bin/bash

# SGI Frontend Setup Script
echo "🚀 Configuration du projet SGI Frontend..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

# Vérifier Angular CLI
if ! command -v ng &> /dev/null; then
    echo "📦 Installation d'Angular CLI..."
    npm install -g @angular/cli@16
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p src/assets/images
mkdir -p src/assets/icons

# Configuration de l'environnement
echo "⚙️ Configuration de l'environnement..."
if [ ! -f src/environments/environment.ts ]; then
    echo "export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  predictionApiUrl: 'http://localhost:5000/api'
};" > src/environments/environment.ts
fi

# Vérifier la configuration
echo "✅ Vérification de la configuration..."
if [ -f package.json ] && [ -f angular.json ]; then
    echo "✅ Configuration terminée avec succès!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Démarrer le backend Spring Boot"
    echo "2. Démarrer le service Python de prédiction"
    echo "3. Lancer l'application: npm start"
    echo ""
    echo "🌐 L'application sera accessible sur: http://localhost:4200"
else
    echo "❌ Erreur lors de la configuration"
    exit 1
fi
