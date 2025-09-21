#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PrayerWidgetModule, NSObject)

RCT_EXTERN_METHOD(startPrayerActivity:(NSString *)prayerId
                  name:(NSString *)name
                  age:(NSNumber *)age
                  deathDate:(NSNumber *)deathDate
                  location:(NSString *)location
                  personalMessage:(NSString *)personalMessage
                  creatorId:(NSString *)creatorId
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(updatePrayerActivity:(NSString *)activityId
                  prayerCount:(NSNumber *)prayerCount
                  lastPrayerTime:(NSNumber *)lastPrayerTime
                  isActive:(BOOL)isActive
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(endPrayerActivity:(NSString *)activityId
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(areActivitiesEnabled:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getActiveActivities:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
