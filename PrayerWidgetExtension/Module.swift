import Foundation
import ActivityKit
import WidgetKit

@objc(PrayerWidgetModule)
class PrayerWidgetModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // Démarrer une Live Activity pour une prière
    @objc
    func startPrayerActivity(
        _ prayerId: String,
        name: String,
        age: NSNumber,
        deathDate: NSNumber,
        location: String,
        personalMessage: String,
        creatorId: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        
        // Vérifier si les Live Activities sont disponibles
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            rejecter("ACTIVITIES_DISABLED", "Les Live Activities ne sont pas activées", nil)
            return
        }
        
        // Créer les attributs de la prière
        let attributes = PrayerAttributes(
            prayerId: prayerId,
            name: name,
            age: age.intValue,
            deathDate: Date(timeIntervalSince1970: deathDate.doubleValue / 1000),
            location: location,
            personalMessage: personalMessage,
            creatorId: creatorId
        )
        
        // Créer l'état initial
        let initialState = PrayerAttributes.ContentState(
            prayerCount: 0,
            lastPrayerTime: Date(),
            isActive: true
        )
        
        // Démarrer la Live Activity
        do {
            let activity = try Activity<PrayerAttributes>.request(
                attributes: attributes,
                content: .init(state: initialState, staleDate: nil),
                pushType: nil
            )
            
            resolver(activity.id)
        } catch {
            rejecter("ACTIVITY_ERROR", "Erreur lors de la création de la Live Activity: \(error.localizedDescription)", error)
        }
    }
    
    // Mettre à jour une Live Activity
    @objc
    func updatePrayerActivity(
        _ activityId: String,
        prayerCount: NSNumber,
        lastPrayerTime: NSNumber,
        isActive: Bool,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        
        // Trouver l'activité par ID
        guard let activity = Activity<PrayerAttributes>.activities.first(where: { $0.id == activityId }) else {
            rejecter("ACTIVITY_NOT_FOUND", "Live Activity non trouvée", nil)
            return
        }
        
        // Créer le nouvel état
        let newState = PrayerAttributes.ContentState(
            prayerCount: prayerCount.intValue,
            lastPrayerTime: Date(timeIntervalSince1970: lastPrayerTime.doubleValue / 1000),
            isActive: isActive
        )
        
        // Mettre à jour l'activité
        Task {
            await activity.update(using: newState)
            resolver(true)
        }
    }
    
    // Terminer une Live Activity
    @objc
    func endPrayerActivity(
        _ activityId: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        
        // Trouver l'activité par ID
        guard let activity = Activity<PrayerAttributes>.activities.first(where: { $0.id == activityId }) else {
            rejecter("ACTIVITY_NOT_FOUND", "Live Activity non trouvée", nil)
            return
        }
        
        // Terminer l'activité
        Task {
            await activity.end(dismissalPolicy: .immediate)
            resolver(true)
        }
    }
    
    // Vérifier si les Live Activities sont activées
    @objc
    func areActivitiesEnabled(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver(ActivityAuthorizationInfo().areActivitiesEnabled)
    }
    
    // Obtenir toutes les activités actives
    @objc
    func getActiveActivities(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let activeActivities = Activity<PrayerAttributes>.activities.map { activity in
            return [
                "id": activity.id,
                "prayerId": activity.attributes.prayerId,
                "name": activity.attributes.name,
                "prayerCount": activity.content.state.prayerCount,
                "lastPrayerTime": activity.content.state.lastPrayerTime.timeIntervalSince1970 * 1000,
                "isActive": activity.content.state.isActive
            ]
        }
        resolver(activeActivities)
    }
}
