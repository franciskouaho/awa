#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PrayerWidgetModule, NSObject)

  RCT_EXTERN_METHOD(areActivitiesEnabled:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
  RCT_EXTERN_METHOD(startActivity:(NSString *)name age:(NSInteger)age location:(NSString *)location personalMessage:(NSString *)personalMessage deathDate:(double)deathDate prayerId:(NSString *)prayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
  RCT_EXTERN_METHOD(updateActivity:(NSString *)activityId prayerCount:(NSInteger)prayerCount resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
  RCT_EXTERN_METHOD(endActivity:(NSString *)activityId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
