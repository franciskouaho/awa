import Foundation

@objc(PrayerWidgetDataManager)
class PrayerWidgetDataManager: NSObject {
  
  private static let appGroupIdentifier = "group.com.emplica.awa"
  private static let prayerDataKey = "currentPrayerData"
  
  @objc
  static func savePrayerData(_ prayerData: [String: Any]) {
    guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      print("❌ Failed to access App Groups UserDefaults")
      return
    }
    
    do {
      let jsonData = try JSONSerialization.data(withJSONObject: prayerData, options: [])
      userDefaults.set(jsonData, forKey: prayerDataKey)
      userDefaults.synchronize()
      print("✅ Prayer data saved to App Groups: \(prayerData)")
    } catch {
      print("❌ Error saving prayer data: \(error)")
    }
  }
  
  @objc
  static func getPrayerData() -> [String: Any]? {
    guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      print("❌ Failed to access App Groups UserDefaults")
      return nil
    }
    
    guard let data = userDefaults.data(forKey: prayerDataKey) else {
      print("❌ No prayer data found in App Groups")
      return nil
    }
    
    do {
      let prayerData = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
      print("✅ Prayer data retrieved from App Groups: \(prayerData ?? [:])")
      return prayerData
    } catch {
      print("❌ Error retrieving prayer data: \(error)")
      return nil
    }
  }
}
