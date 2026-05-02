import SwiftUI

struct WillowCompanionView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Willow", subtitle: "Therapist-enabled engagement layer. No streaks, no punishment.") {
            statusCard
            weekCard
            giftCollection
        }
        .navigationTitle("Willow")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var statusCard: some View {
        WillowCard {
            VStack(alignment: .center, spacing: 14) {
                ZStack {
                    Circle()
                        .fill(store.theme.brand.opacity(0.12))
                        .frame(width: 132, height: 132)
                    Image(systemName: "tree.fill")
                        .font(.system(size: 72))
                        .foregroundColor(store.theme.brand)
                }
                Text("Resting growth")
                    .willowFont(store, size: 22, weight: .bold)
                    .foregroundColor(store.theme.text)
                Text("Willow only appears because \(store.therapistName) enabled it for you. You can hide it from Settings at any time.")
                    .willowFont(store, size: 14)
                    .foregroundColor(store.theme.muted)
                    .multilineTextAlignment(.center)
                if store.growthPhraseEnabled {
                    Text("Growth is not linear; it is longitudinal.")
                        .willowFont(store, size: 15, weight: .semibold)
                        .foregroundColor(store.theme.brand)
                        .padding(.top, 2)
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var weekCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 14) {
                SectionLabel("This week's care window", detail: "\(store.willowWeekCount)/7")
                HStack(spacing: 8) {
                    ForEach(1...7, id: \.self) { day in
                        VStack(spacing: 6) {
                            Circle()
                                .fill(day <= store.willowWeekCount ? store.theme.brand : store.theme.cardAlt)
                                .frame(width: 30, height: 30)
                                .overlay {
                                    if day <= store.willowWeekCount {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                }
                            Text("\(day)")
                                .willowFont(store, size: 10)
                                .foregroundColor(store.theme.muted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                Text("The week resets gently. A missed day does not remove past gifts or progress.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
            }
        }
    }

    private var giftCollection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Collection", detail: "Permanent")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(store.willowGifts) { gift in
                    WillowCard {
                        VStack(alignment: .leading, spacing: 10) {
                            Image(systemName: gift.icon)
                                .font(.system(size: 24))
                                .foregroundColor(gift.earned ? store.theme.brand : store.theme.muted.opacity(0.6))
                            Text(gift.title)
                                .willowFont(store, size: 14, weight: .semibold)
                                .foregroundColor(store.theme.text)
                            Text(gift.earned ? "Earned" : "Resting")
                                .willowFont(store, size: 12)
                                .foregroundColor(store.theme.muted)
                        }
                    }
                    .opacity(gift.earned ? 1 : 0.58)
                }
            }
        }
    }
}
