//
//  PrayerWidgetExtension.swift
//  PrayerWidgetExtension
//
//  Created by Francis KOUAHO on 22/09/2025.
//

import WidgetKit
import SwiftUI

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
        let entry = PrayerEntry(
            date: Date(),
            name: "Exemple",
            age: 70,
            deathDate: Date(),
            location: "Paris",
            personalMessage: "Que Dieu ait son âme"
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> ()) {
        let entry = PrayerEntry(
            date: Date(),
            name: "Défunt",
            age: 60,
            deathDate: Date(),
            location: "Ville",
            personalMessage: "Prière pour le repos de son âme"
        )

        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
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
