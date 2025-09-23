//
//  PrayerWidgetExtension.swift
//  PrayerWidgetExtension
//
//  Created by Francis KOUAHO on 22/09/2025.
//

import SwiftUI
import WidgetKit

// Clé pour partager les données via App Groups
private let appGroupIdentifier = "group.com.emplica.awa"
private let bookmarksKey = "bookmarkedPrayers"

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

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        let entries = loadBookmarkedPrayers()
        completion(entries.first ?? placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let entries = loadBookmarkedPrayers()
        let now = Date()
        var timelineEntries: [PrayerEntry] = []

        // Afficher une prière différente toutes les heures
        for (index, entry) in entries.enumerated() {
            let entryDate = Calendar.current.date(byAdding: .hour, value: index, to: now) ?? now
            timelineEntries.append(
                PrayerEntry(
                    date: entryDate,
                    name: entry.name,
                    age: entry.age,
                    deathDate: entry.deathDate,
                    location: entry.location,
                    personalMessage: entry.personalMessage
                )
            )
        }

        // Si aucun bookmark, afficher le placeholder
        if timelineEntries.isEmpty {
            timelineEntries = [placeholder(in: context)]
        }

        let timeline = Timeline(entries: timelineEntries, policy: .atEnd)
        completion(timeline)
    }

    private func loadBookmarkedPrayers() -> [PrayerEntry] {
        if let userDefaults = UserDefaults(suiteName: appGroupIdentifier),
            let data = userDefaults.data(forKey: bookmarksKey),
            let prayers = try? JSONDecoder().decode([PrayerData].self, from: data)
        {
            return prayers.map { prayer in
                PrayerEntry(
                    date: Date(),
                    name: prayer.name,
                    age: prayer.age,
                    deathDate: Date(timeIntervalSince1970: prayer.deathDate / 1000),
                    location: prayer.location,
                    personalMessage: prayer.personalMessage
                )
            }
        }
        return []
    }
}

// Structure pour décoder les données JSON
struct PrayerData: Codable {
    let prayerId: String
    let name: String
    let age: Int
    let location: String
    let personalMessage: String
    let deathDate: Double  // Unix timestamp en millisecondes
}

struct PrayerWidgetExtensionEntryView: View {
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
