#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PrayerWidgetDataManager, NSObject)

RCT_EXTERN_METHOD(savePrayerData:(NSDictionary *)prayerData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getPrayerData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
