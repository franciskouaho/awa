import Foundation
import ActivityKit

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
}
