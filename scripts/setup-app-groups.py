#!/usr/bin/env python3
"""
Script pour configurer automatiquement les App Groups
"""

import os
import plistlib


def setup_app_groups():
    print("🔐 Configuration automatique des App Groups...")
    
    # Créer les entitlements pour l'app principale
    main_entitlements = "ios/Awa/Awa.entitlements"
    
    if not os.path.exists(main_entitlements):
        print("📝 Création des entitlements pour l'app principale...")
        
        entitlements_data = {
            'com.apple.security.application-groups': ['group.com.emplica.awa']
        }
        
        with open(main_entitlements, 'wb') as f:
            plistlib.dump(entitlements_data, f)
        
        print("✅ Entitlements créés pour l'app principale")
    else:
        print("✅ Entitlements de l'app principale existent déjà")
    
    # Vérifier les entitlements de l'extension
    widget_entitlements = "ios/AwaWidgetExtension/AwaWidgetExtension.entitlements"
    
    if not os.path.exists(widget_entitlements):
        print("📝 Création des entitlements pour l'extension...")
        
        entitlements_data = {
            'com.apple.security.application-groups': ['group.com.emplica.awa']
        }
        
        with open(widget_entitlements, 'wb') as f:
            plistlib.dump(entitlements_data, f)
        
        print("✅ Entitlements créés pour l'extension")
    else:
        print("✅ Entitlements de l'extension existent déjà")
    
    print("✅ Configuration des App Groups terminée!")
    
    return True

if __name__ == "__main__":
    setup_app_groups()
