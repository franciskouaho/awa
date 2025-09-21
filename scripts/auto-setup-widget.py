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

def find_widget_extension_target(content):
    """Trouve le target AwaWidgetExtension"""
    pattern = r'(\w+ /\* AwaWidgetExtension \*/ = \{[^}]*?name = AwaWidgetExtension;[^}]*?\};)'
    match = re.search(pattern, content, re.DOTALL)
    return match.group(1) if match else None

def add_swift_files_to_extension():
    print("🔧 Configuration automatique de l'extension widget...")
    
    project_file = "ios/Awa.xcodeproj/project.pbxproj"
    
    if not os.path.exists(project_file):
        print("❌ Fichier project.pbxproj non trouvé")
        return False
    
    # Lire le fichier
    with open(project_file, 'r') as f:
        content = f.read()
    
    # Vérifier si l'extension existe
    if "AwaWidgetExtension" not in content:
        print("❌ Extension AwaWidgetExtension non trouvée")
        return False
    
    print("✅ Extension AwaWidgetExtension trouvée")
    
    # Fichiers Swift à ajouter
    swift_files = [
        "SharedTypes.swift",
        "PrayerWidget.swift", 
        "PrayerLiveActivity.swift",
        "PrayerWidgetBundle.swift"
    ]
    
    # Générer les UUIDs
    file_refs = {}
    build_phases = {}
    
    for swift_file in swift_files:
        file_refs[swift_file] = generate_uuid()
        build_phases[swift_file] = generate_uuid()
    
    # Ajouter les références de fichiers
    print("📁 Ajout des références de fichiers...")
    
    for swift_file, file_id in file_refs.items():
        if f"/* {swift_file} */" not in content:
            file_ref = f'\t\t{file_id} /* {swift_file} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{swift_file}"; sourceTree = "<group>"; }};'
            
            # Trouver la fin de la section PBXFileReference
            pattern = r'(\t\t[A-F0-9]{24} /\* .* \*/ = \{isa = PBXFileReference;.*?\};)'
            matches = list(re.finditer(pattern, content))
            if matches:
                last_match = matches[-1]
                insert_pos = last_match.end()
                content = content[:insert_pos] + '\n' + file_ref + content[insert_pos:]
                print(f"✅ {swift_file} ajouté aux références")
    
    # Ajouter les fichiers aux sources de l'extension
    print("🔨 Ajout aux sources de l'extension...")
    
    # Trouver la phase Sources de AwaWidgetExtension
    sources_pattern = r'(AwaWidgetExtension.*?buildPhases = \(\s*[A-F0-9]{24} /\* Sources \*/ = \{[^}]*?files = \(\s*)([^)]*?)(\s*\);.*?runOnlyForDeploymentPostprocessing = 0;\s*\};\s*[A-F0-9]{24} /\* Frameworks \*/)'
    sources_match = re.search(sources_pattern, content, re.DOTALL)
    
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
        print("✅ Fichiers ajoutés aux sources de l'extension")
    
    # Ajouter les fichiers au groupe AwaWidgetExtension
    print("📂 Ajout au groupe AwaWidgetExtension...")
    
    # Trouver le groupe AwaWidgetExtension
    group_pattern = r'(AwaWidgetExtension = \{[^}]*?children = \(\s*)([^)]*?)(\s*\);.*?sourceTree = "<group>";\s*\};)'
    group_match = re.search(group_pattern, content, re.DOTALL)
    
    if group_match:
        group_start = group_match.start(2)
        group_end = group_match.end(2)
        group_content = group_match.group(2)
        
        # Ajouter les nouveaux fichiers
        new_group = group_content
        for swift_file, file_id in file_refs.items():
            if f"/* {swift_file} */" not in group_content:
                new_group += f'\n\t\t\t\t{file_id} /* {swift_file} */,'
        
        content = content[:group_start] + new_group + content[group_end:]
        print("✅ Fichiers ajoutés au groupe AwaWidgetExtension")
    
    # Sauvegarder le fichier modifié
    with open(project_file, 'w') as f:
        f.write(content)
    
    print("✅ Configuration automatique terminée!")
    print("\n🎯 Prochaines étapes:")
    print("1. Ouvrez Xcode: open ios/Awa.xcworkspace")
    print("2. Configurez les App Groups dans Signing & Capabilities")
    print("3. Build et testez sur votre iPhone!")
    
    return True

if __name__ == "__main__":
    add_swift_files_to_extension()
