//
//  PrayerWidgetModule.m
//  PrayerWidgetExtension
//
//  Created by Francis KOUAHO on 22/09/2025.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PrayerWidgetModule, NSObject)

RCT_EXTERN_METHOD(savePrayerData:(NSDictionary *)prayerData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(saveWidgetConfiguration:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWidgetConfiguration:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
