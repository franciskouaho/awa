import WidgetKit
import SwiftUI

struct PrayerWidget: Widget {
    let kind: String = "PrayerWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Prière pour un défunt")
        .description("Affiche une prière pour un défunt avec un compteur de prières.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            prayerId: "placeholder",
            name: "Nom du défunt",
            age: 65,
            deathDate: Date(),
            location: "Lieu",
            personalMessage: "Message personnel",
            prayerCount: 0,
            lastPrayerTime: Date(),
            isActive: true
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> ()) {
        let entry = PrayerEntry(
            date: Date(),
            prayerId: "snapshot",
            name: "Exemple",
            age: 70,
            deathDate: Date(),
            location: "Paris",
            personalMessage: "Que Dieu ait son âme",
            prayerCount: 15,
            lastPrayerTime: Date(),
            isActive: true
        )
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> ()) {
        // Pour l'instant, on retourne une entrée statique
        // Dans une vraie implémentation, on récupérerait les données depuis UserDefaults ou Core Data
        let entry = PrayerEntry(
            date: Date(),
            prayerId: "timeline",
            name: "Défunt",
            age: 60,
            deathDate: Date(),
            location: "Ville",
            personalMessage: "Prière pour le repos de son âme",
            prayerCount: 0,
            lastPrayerTime: Date(),
            isActive: true
        )
        
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct PrayerEntry: TimelineEntry {
    let date: Date
    let prayerId: String
    let name: String
    let age: Int
    let deathDate: Date
    let location: String
    let personalMessage: String
    let prayerCount: Int
    let lastPrayerTime: Date
    let isActive: Bool
}

struct PrayerWidgetEntryView: View {
    var entry: PrayerProvider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // En-tête avec nom et âge
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.name)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("\(entry.age) ans")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Icône de prière
                Image(systemName: "hands.clap.fill")
                    .foregroundColor(.blue)
                    .font(.title2)
            }
            
            // Message personnel
            Text(entry.personalMessage)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            
            Spacer()
            
            // Compteur de prières
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundColor(.red)
                    .font(.caption)
                
                Text("\(entry.prayerCount) prières")
                    .font(.caption)
                    .fontWeight(.medium)
                
                Spacer()
                
                // Statut actif
                if entry.isActive {
                    Circle()
                        .fill(.green)
                        .frame(width: 8, height: 8)
                }
            }
        }
        .padding()
    }
}

#Preview(as: .systemSmall) {
    PrayerWidget()
} timeline: {
    PrayerEntry(
        date: .now,
        prayerId: "preview",
        name: "Marie Dubois",
        age: 72,
        deathDate: .now,
        location: "Lyon",
        personalMessage: "Que Dieu ait son âme en paix",
        prayerCount: 23,
        lastPrayerTime: .now,
        isActive: true
    )
}
