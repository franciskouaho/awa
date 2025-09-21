import Foundation
import ActivityKit
import WidgetKit

// MARK: - PrayerAttributes for Live Activities
struct PrayerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var prayerCount: Int
        var lastPrayerTime: Date
        var isActive: Bool
    }
    
    var prayerId: String
    var name: String
    var age: Int
    var deathDate: Date
    var location: String
    var personalMessage: String
    var creatorId: String
    
    // For previews
    fileprivate static var preview: PrayerAttributes {
        PrayerAttributes(
            prayerId: "preview-id",
            name: "John Doe",
            age: 75,
            deathDate: Date(),
            location: "New York",
            personalMessage: "May he rest in peace",
            creatorId: "creator-id"
        )
    }
}

extension PrayerAttributes.ContentState {
    fileprivate static var smiley: PrayerAttributes.ContentState {
        PrayerAttributes.ContentState(prayerCount: 10, lastPrayerTime: Date(), isActive: true)
    }

    fileprivate static var starfield: PrayerAttributes.ContentState {
        PrayerAttributes.ContentState(prayerCount: 25, lastPrayerTime: Date(), isActive: true)
    }
}

// MARK: - PrayerEntry for Widgets
struct PrayerEntry: TimelineEntry {
    let date: Date
    let prayerId: String
    let name: String
    let age: Int
    let deathDate: Date
    let location: String
    let personalMessage: String
    var prayerCount: Int
    var lastPrayerTime: Date
    var isActive: Bool
}