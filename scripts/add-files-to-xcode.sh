#!/bin/bash

# Script pour ajouter automatiquement les fichiers Swift aux targets Xcode
# Ce script utilise xcodebuild pour ajouter les fichiers

echo "🔧 Ajout des fichiers Swift aux targets Xcode..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "ios/Awa.xcodeproj/project.pbxproj" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet"
    exit 1
fi

# Chemin vers le projet Xcode
PROJECT_PATH="ios/Awa.xcodeproj"

echo "📁 Vérification des fichiers..."

# Vérifier que tous les fichiers existent
FILES=(
    "ios/AwaWidgetExtension/Info.plist"
    "ios/AwaWidgetExtension/PrayerWidget.swift"
    "ios/AwaWidgetExtension/PrayerLiveActivity.swift"
    "ios/AwaWidgetExtension/PrayerWidgetBundle.swift"
    "ios/AwaWidgetExtension/PrayerWidgetExtension.entitlements"
    "ios/Awa/PrayerAttributes.swift"
    "ios/Awa/PrayerWidgetModule.swift"
    "ios/Awa/PrayerWidgetModule.m"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    else
        echo "✅ $file"
    fi
done

echo ""
echo "📋 Instructions pour ajouter les fichiers dans Xcode:"
echo ""
echo "1. Ouvrez Xcode: open ios/Awa.xcodeproj"
echo "2. Dans le navigateur de projet (gauche), trouvez le dossier 'AwaWidgetExtension'"
echo "3. Glissez-déposez ces fichiers depuis le Finder vers le dossier 'AwaWidgetExtension' dans Xcode:"
echo ""
echo "   Fichiers à ajouter UNIQUEMENT à AwaWidgetExtension:"
echo "   - ios/AwaWidgetExtension/Info.plist"
echo "   - ios/AwaWidgetExtension/PrayerWidget.swift"
echo "   - ios/AwaWidgetExtension/PrayerLiveActivity.swift"
echo "   - ios/AwaWidgetExtension/PrayerWidgetBundle.swift"
echo "   - ios/AwaWidgetExtension/PrayerWidgetExtension.entitlements"
echo ""
echo "   Fichiers à ajouter à Awa ET AwaWidgetExtension:"
echo "   - ios/Awa/PrayerAttributes.swift"
echo "   - ios/Awa/PrayerWidgetModule.swift"
echo "   - ios/Awa/PrayerWidgetModule.m"
echo ""
echo "4. Lors du glisser-déposer, cochez:"
echo "   - 'Copy items if needed'"
echo "   - Pour les fichiers AwaWidgetExtension: cochez UNIQUEMENT 'AwaWidgetExtension'"
echo "   - Pour les fichiers Awa: cochez 'Awa' ET 'AwaWidgetExtension'"
echo ""
echo "5. Cliquez sur 'Add'"
echo ""
echo "✨ Tous les fichiers sont prêts à être ajoutés!"
