#!/usr/bin/env python3
"""
Script pour configurer automatiquement l'extension widget dans Xcode
"""

import os


def setup_widget_extension():
    print("🔧 Configuration automatique de l'extension widget...")
    
    # Chemins des fichiers
    project_file = "ios/Awa.xcodeproj/project.pbxproj"
    widget_dir = "ios/AwaWidgetExtension"
    
    # Vérifier que l'extension existe
    if not os.path.exists(widget_dir):
        print("❌ Le dossier AwaWidgetExtension n'existe pas. Créez d'abord l'extension dans Xcode.")
        return False
    
    print("✅ Extension widget trouvée")
    
    # Lire le fichier project.pbxproj
    with open(project_file, 'r') as f:
        content = f.read()
    
    # Ajouter les fichiers Swift à l'extension
    swift_files = [
        "SharedTypes.swift",
        "PrayerWidget.swift", 
        "PrayerLiveActivity.swift",
        "PrayerWidgetBundle.swift"
    ]
    
    print("📁 Ajout des fichiers Swift à l'extension...")
    
    for swift_file in swift_files:
        file_path = f"{widget_dir}/{swift_file}"
        if os.path.exists(file_path):
            print(f"✅ {swift_file} trouvé")
        else:
            print(f"❌ {swift_file} manquant")
    
    # Configurer les App Groups
    print("🔐 Configuration des App Groups...")
    
    # Ajouter App Groups au target principal
    main_entitlements = "ios/Awa/Awa.entitlements"
    if not os.path.exists(main_entitlements):
        # Créer le fichier entitlements pour l'app principale
        with open(main_entitlements, 'w') as f:
            f.write('''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.emplica.awa</string>
    </array>
</dict>
</plist>''')
        print("✅ Entitlements créés pour l'app principale")
    
    # Vérifier les entitlements de l'extension
    widget_entitlements = f"{widget_dir}/AwaWidgetExtension.entitlements"
    if os.path.exists(widget_entitlements):
        print("✅ Entitlements de l'extension trouvés")
    else:
        print("❌ Entitlements de l'extension manquants")
    
    print("\n🎯 Instructions pour finaliser dans Xcode:")
    print("1. Ouvrez Xcode: open ios/Awa.xcworkspace")
    print("2. Sélectionnez le projet Awa")
    print("3. Pour chaque target (Awa et AwaWidgetExtension):")
    print("   - Allez dans 'Signing & Capabilities'")
    print("   - Cliquez '+ Capability'")
    print("   - Ajoutez 'App Groups'")
    print("   - Ajoutez: group.com.emplica.awa")
    print("4. Ajoutez les fichiers Swift à l'extension:")
    print("   - Clic droit sur AwaWidgetExtension")
    print("   - 'Add Files to AwaWidgetExtension'")
    print("   - Sélectionnez tous les fichiers .swift")
    print("5. Build et testez sur votre iPhone!")
    
    return True

if __name__ == "__main__":
    setup_widget_extension()
