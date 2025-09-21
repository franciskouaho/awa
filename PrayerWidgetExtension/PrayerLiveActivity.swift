import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.2, *)
struct PrayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerAttributes.self) { context in
            // Vue pour l'écran de verrouillage
            LockScreenLiveActivityView(context: context)
        } dynamicIsland: { context in
            // Vue pour le Dynamic Island
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text(context.attributes.name)
                            .font(.headline)
                            .fontWeight(.bold)
                        Text("\(context.attributes.age) ans")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        Text("\(context.state.prayerCount)")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("prières")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.personalMessage)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
            } compactLeading: {
                Image(systemName: "hands.clap.fill")
                    .foregroundColor(.blue)
            } compactTrailing: {
                Text("\(context.state.prayerCount)")
                    .font(.caption)
                    .fontWeight(.bold)
            } minimal: {
                Image(systemName: "hands.clap.fill")
                    .foregroundColor(.blue)
            }
        }
    }
}

@available(iOS 16.2, *)
struct LockScreenLiveActivityView: View {
    let context: ActivityViewContext<PrayerAttributes>
    
    var body: some View {
        VStack(spacing: 12) {
            // En-tête
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(context.attributes.name)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("\(context.attributes.age) ans • \(context.attributes.location)")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                Spacer()
                
                // Statut
                if context.state.isActive {
                    Circle()
                        .fill(.green)
                        .frame(width: 12, height: 12)
                }
            }
            
            // Message personnel
            Text(context.attributes.personalMessage)
                .font(.body)
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .lineLimit(3)
            
            // Compteur de prières
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundColor(.red)
                    .font(.title3)
                
                Text("\(context.state.prayerCount) prières")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Spacer()
                
                // Dernière prière
                VStack(alignment: .trailing) {
                    Text("Dernière prière")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Text(context.state.lastPrayerTime, style: .relative)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.blue.opacity(0.8), .purple.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

@available(iOS 16.2, *)
struct PrayerLiveActivity_Previews: PreviewProvider {
    static let attributes = PrayerAttributes(
        prayerId: "preview",
        name: "Marie Dubois",
        age: 72,
        deathDate: Date(),
        location: "Lyon",
        personalMessage: "Que Dieu ait son âme en paix",
        creatorId: "user123"
    )
    
    static let contentState = PrayerAttributes.ContentState(
        prayerCount: 23,
        lastPrayerTime: Date(),
        isActive: true
    )
    
    static var previews: some View {
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.compact))
            .previewDisplayName("Compact")
        
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.expanded))
            .previewDisplayName("Expanded")
        
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.minimal))
            .previewDisplayName("Minimal")
        
        attributes
            .previewContext(contentState, viewKind: .content)
            .previewDisplayName("Lock Screen")
    }
}
