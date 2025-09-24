import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), name: "Nom du défunt", age: 65, location: "Lieu", personalMessage: "Message personnel", deathDate: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = loadBookmarkedPrayers().first ?? placeholder(in: context)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entries = loadBookmarkedPrayers()
        let now = Date()
        var timelineEntries: [SimpleEntry] = []

        // Afficher une prière différente toutes les heures
        for (index, entry) in entries.enumerated() {
            let entryDate = Calendar.current.date(byAdding: .hour, value: index, to: now) ?? now
            timelineEntries.append(
                SimpleEntry(
                    date: entryDate,
                    name: entry.name,
                    age: entry.age,
                    location: entry.location,
                    personalMessage: entry.personalMessage,
                    deathDate: entry.deathDate
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
    
    private func loadBookmarkedPrayers() -> [SimpleEntry] {
        guard let userDefaults = UserDefaults(suiteName: "group.com.emplica.awa") else {
            print("📱 Widget: Cannot access App Group")
            return []
        }

        // Essayer de lire les données comme un objet JSON complet
        if let jsonData = userDefaults.data(forKey: "bookmarkedPrayers") {
            do {
                let prayers = try JSONDecoder().decode([PrayerData].self, from: jsonData)
                print("📱 Widget: Loaded \(prayers.count) bookmarked prayers from JSON data")
                return prayers.map { prayer in
                    let deathDate = Date(timeIntervalSince1970: prayer.deathDate / 1000)
                    return SimpleEntry(
                        date: Date(),
                        name: prayer.name,
                        age: prayer.age,
                        location: prayer.location,
                        personalMessage: prayer.personalMessage,
                        deathDate: deathDate
                    )
                }
            } catch {
                print("📱 Widget: Error decoding JSON data: \(error)")
            }
        }

        // Essayer de lire comme un objet Any
        if let anyData = userDefaults.object(forKey: "bookmarkedPrayers") {
            print("📱 Widget: Found data as Any: \(type(of: anyData))")
            if let arrayData = anyData as? [[String: Any]] {
                print("📱 Widget: Converting from array of dictionaries")
                let prayers = arrayData.compactMap { dict -> PrayerData? in
                    guard let prayerId = dict["prayerId"] as? String,
                          let name = dict["name"] as? String,
                          let age = dict["age"] as? Int,
                          let location = dict["location"] as? String,
                          let personalMessage = dict["personalMessage"] as? String,
                          let deathDate = dict["deathDate"] as? Double else {
                        return nil
                    }
                    return PrayerData(
                        prayerId: prayerId,
                        name: name,
                        age: age,
                        location: location,
                        personalMessage: personalMessage,
                        deathDate: deathDate
                    )
                }
                print("📱 Widget: Loaded \(prayers.count) bookmarked prayers from array")
                return prayers.map { prayer in
                    let deathDate = Date(timeIntervalSince1970: prayer.deathDate / 1000)
                    return SimpleEntry(
                        date: Date(),
                        name: prayer.name,
                        age: prayer.age,
                        location: prayer.location,
                        personalMessage: prayer.personalMessage,
                        deathDate: deathDate
                    )
                }
            }
        }

        print("📱 Widget: No bookmarked prayers found")
        return []
    }
}

struct PrayerData: Codable {
    let prayerId: String
    let name: String
    let age: Int
    let location: String
    let personalMessage: String
    let deathDate: Double  // Unix timestamp en millisecondes
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let name: String
    let age: Int
    let location: String
    let personalMessage: String
    let deathDate: Date
}

struct widgetEntryView : View {
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

                Image(systemName: "moon.fill") // Changed icon
                    .foregroundColor(.green) // Changed color
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

                Image(systemName: "moon.fill") // Changed icon
                    .foregroundColor(.green) // Changed color
                    .font(.caption)
            }
        }
        .padding()
    }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Prière pour un défunt")
        .description("Affiche une prière pour un défunt.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(date: .now, name: "Awa Seck NDIAYE", age: 76, location: "Tivaoune peulh, Sénégal", personalMessage: "Que Dieu ait son âme en paix", deathDate: .now)
}