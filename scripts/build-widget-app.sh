#!/bin/bash

echo "🚀 Configuration et build automatique de l'extension widget..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet"
    exit 1
fi

echo "📱 Vérification des prérequis..."

# Vérifier que Xcode est installé
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode n'est pas installé"
    exit 1
fi

echo "✅ Xcode trouvé"

# Vérifier que l'extension existe
if [ ! -d "ios/AwaWidgetExtension" ]; then
    echo "❌ Extension AwaWidgetExtension non trouvée"
    echo "Créez d'abord l'extension dans Xcode"
    exit 1
fi

echo "✅ Extension widget trouvée"

# Configurer automatiquement les fichiers Swift
echo "🔧 Configuration des fichiers Swift..."
python3 scripts/auto-setup-widget.py

# Configurer les App Groups
echo "🔐 Configuration des App Groups..."
python3 scripts/setup-app-groups.py

# Nettoyer et build
echo "🧹 Nettoyage du projet..."
cd ios && xcodebuild clean -workspace Awa.xcworkspace -scheme Awa

echo "🔨 Build du projet..."
cd .. && yarn ios

echo "✅ Configuration et build terminés!"
echo ""
echo "🎯 Pour tester sur votre iPhone:"
echo "1. Connectez votre iPhone via USB"
echo "2. Sélectionnez votre iPhone dans Xcode"
echo "3. Build et Run (⌘+R)"
echo "4. Testez les widgets sur votre iPhone!"
