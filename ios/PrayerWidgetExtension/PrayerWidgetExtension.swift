//
//  PrayerWidgetExtension.swift
//  PrayerWidgetExtension
//
//  Created by Francis KOUAHO on 22/09/2025.
//

import WidgetKit
import SwiftUI

// Clé pour partager les données via App Groups
private let appGroupIdentifier = "group.com.emplica.awa"
private let prayerDataKey = "currentPrayerData"

struct PrayerEntry: TimelineEntry {
    let date: Date
    let name: String
    let age: Int
    let deathDate: Date
    let location: String
    let personalMessage: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            name: "Nom du défunt",
            age: 65,
            deathDate: Date(),
            location: "Lieu",
            personalMessage: "Message personnel"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> ()) {
        let entry = loadPrayerData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> ()) {
        let entry = loadPrayerData()
        
        // Mettre à jour le widget toutes les heures
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadPrayerData() -> PrayerEntry {
        print("🔍 Widget: Loading prayer data...")
        
        // Charger les données depuis App Groups
        if let userDefaults = UserDefaults(suiteName: appGroupIdentifier),
           let data = userDefaults.data(forKey: prayerDataKey),
           let prayerData = try? JSONDecoder().decode(PrayerData.self, from: data) {
            print("✅ Widget: Found data in App Groups")
            
            return PrayerEntry(
                date: Date(),
                name: prayerData.name,
                age: prayerData.age,
                deathDate: Date(timeIntervalSince1970: prayerData.deathDate / 1000),
                location: prayerData.location,
                personalMessage: prayerData.personalMessage,
            )
        }
        
        // Fallback: essayer de charger depuis UserDefaults standard (pour AsyncStorage)
        print("🔍 Widget: Trying UserDefaults standard...")
        if let data = UserDefaults.standard.data(forKey: prayerDataKey),
           let prayerData = try? JSONDecoder().decode(PrayerData.self, from: data) {
            print("✅ Widget: Found data in UserDefaults standard")
            
            return PrayerEntry(
                date: Date(),
                name: prayerData.name,
                age: prayerData.age,
                deathDate: Date(timeIntervalSince1970: prayerData.deathDate / 1000),
                location: prayerData.location,
                personalMessage: prayerData.personalMessage,
            )
        }
        
        // Essayer de lire depuis AsyncStorage (clé spécifique)
        print("🔍 Widget: Trying AsyncStorage specific key...")
        if let data = UserDefaults.standard.data(forKey: "currentPrayerData"),
           let prayerData = try? JSONDecoder().decode(PrayerData.self, from: data) {
            print("✅ Widget: Found data in AsyncStorage specific key")
            
            return PrayerEntry(
                date: Date(),
                name: prayerData.name,
                age: prayerData.age,
                deathDate: Date(timeIntervalSince1970: prayerData.deathDate / 1000),
                location: prayerData.location,
                personalMessage: prayerData.personalMessage,
            )
        }
        
        // Essayer aussi avec la clé AsyncStorage générique
        if let data = UserDefaults.standard.data(forKey: "RCTAsyncStorageData"),
           let jsonString = String(data: data, encoding: .utf8),
           let jsonData = jsonString.data(using: .utf8),
           let prayerData = try? JSONDecoder().decode(PrayerData.self, from: jsonData) {
            
            return PrayerEntry(
                date: Date(),
                name: prayerData.name,
                age: prayerData.age,
                deathDate: Date(timeIntervalSince1970: prayerData.deathDate / 1000),
                location: prayerData.location,
                personalMessage: prayerData.personalMessage,
            )
        }
        
        // Données par défaut si aucune donnée n'est disponible
        print("❌ Widget: No data found, using default")
        return PrayerEntry(
            date: Date(),
            name: "Aucune prière",
            age: 0,
            deathDate: Date(),
            location: "En attente",
            personalMessage: "Ajoutez une prière dans l'application"
        )
    }
}

// Structure pour décoder les données JSON
struct PrayerData: Codable {
    let prayerId: String
    let name: String
    let age: Int
    let location: String
    let personalMessage: String
    let deathDate: Double // Unix timestamp en millisecondes
}

struct PrayerWidgetExtensionEntryView : View {
    var entry: Provider.Entry
    

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.name)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)

                    Text("\(entry.age) ans • \(entry.location)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Image(systemName: "hands.clap.fill")
                    .foregroundColor(.blue)
                    .font(.title2)
            }

            Text(entry.personalMessage)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(3)
                .multilineTextAlignment(.leading)

            Spacer()

            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.gray)
                    .font(.caption)

                Text("Décédé le \(entry.deathDate, style: .date)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Image(systemName: "hands.clap.fill")
                    .foregroundColor(.blue)
                    .font(.caption)
            }
        }
        .padding()
    }
}

struct PrayerWidgetExtension: Widget {
    let kind: String = "PrayerWidgetExtension"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PrayerWidgetExtensionEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Prière pour un défunt")
        .description("Affiche une prière pour un défunt.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    PrayerWidgetExtension()
} timeline: {
        PrayerEntry(
            date: .now,
            name: "Marie Dubois",
            age: 72,
            deathDate: .now,
            location: "Lyon",
            personalMessage: "Que Dieu ait son âme en paix"
        )
}
