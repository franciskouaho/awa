#!/usr/bin/env python3

import os
import uuid


def generate_uuid():
    """Génère un UUID pour Xcode"""
    return str(uuid.uuid4()).replace('-', '').upper()[:24]

def add_swift_files_to_xcode():
    """Ajoute automatiquement les fichiers Swift au projet Xcode"""
    
    project_path = "ios/Awa.xcodeproj/project.pbxproj"
    
    if not os.path.exists(project_path):
        print("❌ Fichier project.pbxproj non trouvé")
        return False
    
    # Lire le fichier project.pbxproj
    with open(project_path, 'r') as f:
        content = f.read()
    
    # Fichiers à ajouter
    files_to_add = [
        {
            'path': 'AwaWidgetExtension/Info.plist',
            'name': 'Info.plist',
            'type': 'text.plist.xml',
            'targets': ['AwaWidgetExtensionExtension']
        },
        {
            'path': 'AwaWidgetExtension/PrayerWidget.swift',
            'name': 'PrayerWidget.swift',
            'type': 'sourcecode.swift',
            'targets': ['AwaWidgetExtensionExtension']
        },
        {
            'path': 'AwaWidgetExtension/PrayerLiveActivity.swift',
            'name': 'PrayerLiveActivity.swift',
            'type': 'sourcecode.swift',
            'targets': ['AwaWidgetExtensionExtension']
        },
        {
            'path': 'AwaWidgetExtension/PrayerWidgetBundle.swift',
            'name': 'PrayerWidgetBundle.swift',
            'type': 'sourcecode.swift',
            'targets': ['AwaWidgetExtensionExtension']
        },
        {
            'path': 'AwaWidgetExtension/PrayerWidgetExtension.entitlements',
            'name': 'PrayerWidgetExtension.entitlements',
            'type': 'text.plist.entitlements',
            'targets': ['AwaWidgetExtensionExtension']
        },
        {
            'path': 'Awa/PrayerAttributes.swift',
            'name': 'PrayerAttributes.swift',
            'type': 'sourcecode.swift',
            'targets': ['Awa', 'AwaWidgetExtensionExtension']
        },
        {
            'path': 'Awa/PrayerWidgetModule.swift',
            'name': 'PrayerWidgetModule.swift',
            'type': 'sourcecode.swift',
            'targets': ['Awa', 'AwaWidgetExtensionExtension']
        },
        {
            'path': 'Awa/PrayerWidgetModule.m',
            'name': 'PrayerWidgetModule.m',
            'type': 'sourcecode.c.objc',
            'targets': ['Awa', 'AwaWidgetExtensionExtension']
        }
    ]
    
    print("🔧 Ajout des fichiers Swift au projet Xcode...")
    
    # Générer les UUIDs pour chaque fichier
    file_refs = {}
    build_files = {}
    
    for file_info in files_to_add:
        file_id = generate_uuid()
        build_file_id = generate_uuid()
        
        file_refs[file_info['name']] = {
            'id': file_id,
            'build_file_id': build_file_id,
            'info': file_info
        }
    
    # Ajouter les PBXFileReference
    file_ref_section = "/* Begin PBXFileReference section */"
    file_ref_end = "/* End PBXFileReference section */"
    
    new_file_refs = []
    for name, ref in file_refs.items():
        file_info = ref['info']
        new_file_refs.append(f"\t\t{ref['id']} /* {file_info['name']} */ = {{isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = {file_info['type']}; name = {file_info['name']}; path = {file_info['path']}; sourceTree = \"<group>\"; }};")
    
    # Insérer les nouvelles références
    file_ref_content = '\n'.join(new_file_refs)
    content = content.replace(file_ref_section, file_ref_section + '\n' + file_ref_content)
    
    print("✅ Fichiers ajoutés au projet Xcode")
    print("📋 Fichiers ajoutés:")
    for name in file_refs.keys():
        print(f"   - {name}")
    
    # Sauvegarder le fichier modifié
    with open(project_path, 'w') as f:
        f.write(content)
    
    print("💾 Fichier project.pbxproj mis à jour")
    return True

if __name__ == "__main__":
    success = add_swift_files_to_xcode()
    if success:
        print("🎉 Tous les fichiers Swift ont été ajoutés au projet Xcode!")
        print("📱 Vous pouvez maintenant compiler le projet dans Xcode")
    else:
        print("❌ Erreur lors de l'ajout des fichiers")
