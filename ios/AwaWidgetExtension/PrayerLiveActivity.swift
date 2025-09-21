import ActivityKit
import SwiftUI
import WidgetKit

struct PrayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerAttributes.self) { context in
            // For devices that don't support Live Activities, or when they're disabled
            VStack(alignment: .leading) {
                HStack {
                    Text("Prayer for \(context.attributes.name)")
                        .font(.title2)
                }
                Text("Last prayer: \(context.state.lastPrayerTime, style: .time)")
                Text("Total prayers: \(context.state.prayerCount)")
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom")
                }
            } compactLeading: {
                Text("C.Leading")
            } compactTrailing: {
                Text("C.Trailing")
            } minimal: {
                Text("Minimal")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

struct PrayerLiveActivity_Previews: PreviewProvider {
    static let attributes = PrayerAttributes.preview
    static let contentState = PrayerAttributes.ContentState.smiley

    static var previews: some View {
        attributes
            .previewContext(using: contentState)
            .previewDisplayName("Live Activity")
    }
}
