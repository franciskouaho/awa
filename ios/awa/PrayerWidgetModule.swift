//
//  PrayerWidgetModule.swift
//  PrayerWidgetExtension
//
//  Created by Francis KOUAHO on 22/09/2025.
//

import Foundation
import WidgetKit

@objc(PrayerWidgetModule)
class PrayerWidgetModule: NSObject {
  
  private let appGroupIdentifier = "group.com.emplica.awa"
  private let prayerDataKey = "currentPrayerData"
  private let widgetConfigKey = "widgetConfiguration"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func savePrayerData(_ prayerData: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    do {
      // Convertir les données en JSON
      let jsonData = try JSONSerialization.data(withJSONObject: prayerData, options: [])
      
      // Sauvegarder dans App Groups
      guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
        rejecter("APP_GROUP_ERROR", "Cannot access App Group", nil)
        return
      }
      
      userDefaults.set(jsonData, forKey: prayerDataKey)
      userDefaults.synchronize()
      
      // Forcer la mise à jour du widget
      WidgetCenter.shared.reloadAllTimelines()
      
      resolver(["success": true])
      
    } catch {
      rejecter("SAVE_ERROR", "Failed to save prayer data: \(error.localizedDescription)", error)
    }
  }

  @objc
  func saveWidgetConfiguration(_ config: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    do {
      // Convertir la configuration en JSON
      let jsonData = try JSONSerialization.data(withJSONObject: config, options: [])
      
      // Sauvegarder dans App Groups
      guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
        rejecter("APP_GROUP_ERROR", "Cannot access App Group", nil)
        return
      }
      
      userDefaults.set(jsonData, forKey: widgetConfigKey)
      userDefaults.synchronize()
      
      // Forcer la mise à jour du widget
      WidgetCenter.shared.reloadAllTimelines()
      
      resolver(["success": true])
      
    } catch {
      rejecter("SAVE_ERROR", "Failed to save widget configuration: \(error.localizedDescription)", error)
    }
  }

  @objc
  func getWidgetConfiguration(_ resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      rejecter("APP_GROUP_ERROR", "Cannot access App Group", nil)
      return
    }
    
    guard let data = userDefaults.data(forKey: widgetConfigKey) else {
      resolve(nil)
      return
    }
    
    do {
      let config = try JSONSerialization.jsonObject(with: data, options: [])
      resolve(config)
    } catch {
      rejecter("DECODE_ERROR", "Failed to decode widget configuration: \(error.localizedDescription)", error)
    }
  }
}
