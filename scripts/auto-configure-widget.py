#!/usr/bin/env python3
"""
Script pour configurer automatiquement l'extension widget dans project.pbxproj
"""

import os
import re
import uuid


def generate_uuid():
    """Génère un UUID pour Xcode"""
    return str(uuid.uuid4()).replace('-', '').upper()[:24]

def add_files_to_widget_extension():
    print("🔧 Configuration automatique de l'extension widget dans project.pbxproj...")
    
    project_file = "ios/Awa.xcodeproj/project.pbxproj"
    
    if not os.path.exists(project_file):
        print("❌ Fichier project.pbxproj non trouvé")
        return False
    
    # Lire le fichier
    with open(project_file, 'r') as f:
        content = f.read()
    
    # Vérifier si l'extension existe déjà
    if "AwaWidgetExtension" not in content:
        print("❌ Extension AwaWidgetExtension non trouvée dans le projet")
        return False
    
    print("✅ Extension AwaWidgetExtension trouvée")
    
    # Fichiers à ajouter
    swift_files = [
        "SharedTypes.swift",
        "PrayerWidget.swift", 
        "PrayerLiveActivity.swift",
        "PrayerWidgetBundle.swift"
    ]
    
    # Générer les UUIDs pour les fichiers
    file_refs = {}
    build_phases = {}
    
    for swift_file in swift_files:
        file_refs[swift_file] = generate_uuid()
        build_phases[swift_file] = generate_uuid()
    
    # Ajouter les références de fichiers
    print("📁 Ajout des références de fichiers...")
    
    for swift_file, file_id in file_refs.items():
        file_ref = f'\t\t{file_id} /* {swift_file} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{swift_file}"; sourceTree = "<group>"; }};'
        
        # Trouver la section PBXFileReference et ajouter le fichier
        if f"/* {swift_file} */" not in content:
            # Insérer avant la dernière ligne de PBXFileReference
            pattern = r'(\t\t[A-F0-9]{24} /\* .* \*/ = \{isa = PBXFileReference;.*?\};)'
            matches = list(re.finditer(pattern, content))
            if matches:
                last_match = matches[-1]
                insert_pos = last_match.end()
                content = content[:insert_pos] + '\n' + file_ref + content[insert_pos:]
                print(f"✅ {swift_file} ajouté aux références")
    
    # Ajouter les fichiers aux build phases
    print("🔨 Ajout aux build phases...")
    
    # Trouver le target AwaWidgetExtension
    widget_target_pattern = r'(AwaWidgetExtension.*?buildPhases = \(\s*)([A-F0-9]{24} /\* Sources \*/,\s*[A-F0-9]{24} /\* Frameworks \*/,\s*[A-F0-9]{24} /\* Resources \*/)'
    widget_match = re.search(widget_target_pattern, content, re.DOTALL)
    
    if widget_match:
        # Ajouter les fichiers aux sources
        sources_phase_pattern = r'([A-F0-9]{24} /\* Sources \*/ = \{[^}]*?files = \(\s*)([^)]*?)(\s*\);'
        sources_match = re.search(sources_phase_pattern, content, re.DOTALL)
        
        if sources_match:
            sources_start = sources_match.start(2)
            sources_end = sources_match.end(2)
            sources_content = sources_match.group(2)
            
            # Ajouter les nouveaux fichiers
            new_sources = sources_content
            for swift_file, build_id in build_phases.items():
                if f"/* {swift_file} */" not in sources_content:
                    new_sources += f'\n\t\t\t\t{build_id} /* {swift_file} in Sources */,'
            
            content = content[:sources_start] + new_sources + content[sources_end:]
            print("✅ Fichiers ajoutés aux sources")
    
    # Sauvegarder le fichier modifié
    with open(project_file, 'w') as f:
        f.write(content)
    
    print("✅ Configuration terminée!")
    print("\n🎯 Prochaines étapes:")
    print("1. Ouvrez Xcode: open ios/Awa.xcworkspace")
    print("2. Configurez les App Groups dans Signing & Capabilities")
    print("3. Build et testez sur votre iPhone!")
    
    return True

if __name__ == "__main__":
    add_files_to_widget_extension()
