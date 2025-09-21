import ActivityKit
import Foundation

// Structure pour les données de prière dans le widget
struct PrayerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Données dynamiques qui peuvent changer
        var prayerCount: Int
        var lastPrayerTime: Date
        var isActive: Bool
    }
    
    // Données statiques de la prière
    var prayerId: String
    var name: String
    var age: Int
    var deathDate: Date
    var location: String
    var personalMessage: String
    var creatorId: String
    
    // Configuration du widget
    var widgetName: String {
        return "Prière pour \(name)"
    }
    var widgetDescription: String {
        return "Priez pour \(name) qui a quitté ce monde à l'âge de \(age) ans"
    }
}
