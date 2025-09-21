import Foundation
import React
import ActivityKit

@objc(PrayerWidgetModule)
class PrayerWidgetModule: NSObject {
    
    @objc
    func areActivitiesEnabled(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            resolve(Activity<PrayerAttributes>.areActivitiesEnabled)
        } else {
            resolve(false)
        }
    }
    
    @objc
    func startActivity(_ name: String, age: Int, location: String, personalMessage: String, deathDate: Double, prayerId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            let attributes = PrayerAttributes(
                prayerId: prayerId,
                name: name,
                age: age,
                deathDate: Date(timeIntervalSince1970: deathDate),
                location: location,
                personalMessage: personalMessage,
                creatorId: ""
            )
            let initialContentState = PrayerAttributes.ContentState(
                prayerCount: 0,
                lastPrayerTime: Date(),
                isActive: true
            )
            
            do {
                let activity = try Activity.request(attributes: attributes, contentState: initialContentState, staleDate: nil as Date?)
                print("Requested a Live Activity \(activity.id)")
                resolve(activity.id)
            } catch (let error) {
                print("Error requesting Live Activity \(error.localizedDescription)")
                reject("activity_error", error.localizedDescription, nil)
            }
        } else {
            reject("unsupported_version", "Live Activities are only available on iOS 16.1+", nil)
        }
    }
    
    @objc
    func updateActivity(_ activityId: String, prayerCount: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            Task {
                for activity in Activity<PrayerAttributes>.activities {
                    if activity.id == activityId {
                        let updatedContentState = PrayerAttributes.ContentState(
                            prayerCount: prayerCount,
                            lastPrayerTime: Date(),
                            isActive: true
                        )
                        await activity.update(using: updatedContentState)
                        print("Updated Live Activity \(activity.id) with prayer count \(prayerCount)")
                        resolve(true)
                        return
                    }
                }
                reject("not_found", "Activity with ID \(activityId) not found", nil)
            }
        } else {
            reject("unsupported_version", "Live Activities are only available on iOS 16.1+", nil)
        }
    }
    
    @objc
    func endActivity(_ activityId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            Task {
                for activity in Activity<PrayerAttributes>.activities {
                    if activity.id == activityId {
                        await activity.end(using: activity.contentState, dismissalPolicy: .immediate)
                        print("Ended Live Activity \(activity.id)")
                        resolve(true)
                        return
                    }
                }
                reject("not_found", "Activity with ID \(activityId) not found", nil)
            }
        } else {
            reject("unsupported_version", "Live Activities are only available on iOS 16.1+", nil)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
