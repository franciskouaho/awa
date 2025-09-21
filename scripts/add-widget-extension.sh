#!/bin/bash

# Script pour ajouter l'extension widget au projet Xcode
# Ce script doit être exécuté depuis le répertoire ios/

echo "🔧 Ajout de l'extension widget au projet Xcode..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "Awa.xcodeproj/project.pbxproj" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire ios/"
    exit 1
fi

# Créer le répertoire de l'extension s'il n'existe pas
mkdir -p AwaWidgetExtension

echo "✅ Extension widget créée dans ios/AwaWidgetExtension/"
echo ""
echo "📋 Prochaines étapes manuelles dans Xcode:"
echo "1. Ouvrir ios/Awa.xcodeproj dans Xcode"
echo "2. Clic droit sur le projet 'Awa' → Add Target"
echo "3. Choisir 'Widget Extension'"
echo "4. Nom: 'AwaWidgetExtension'"
echo "5. Bundle Identifier: 'com.emplica.awa.AwaWidgetExtension'"
echo "6. Cocher 'Include Live Activity'"
echo "7. Cocher 'Include Configuration Intent'"
echo "8. Cliquer 'Finish'"
echo ""
echo "🔧 Configuration dans Xcode:"
echo "- Ajouter les fichiers Swift créés à la target AwaWidgetExtension"
echo "- Configurer les Build Settings (Swift version, etc.)"
echo "- Ajouter les frameworks nécessaires (WidgetKit, SwiftUI)"
echo ""
echo "📱 Test:"
echo "- Build le projet"
echo "- Ajouter le widget depuis l'écran d'accueil iOS"
echo ""
echo "✨ L'extension widget est prête à être configurée dans Xcode!"
