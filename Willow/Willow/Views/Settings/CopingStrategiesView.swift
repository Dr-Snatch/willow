import SwiftUI

struct CopingStrategiesView: View {
    @EnvironmentObject var store: AppStore
    @State private var expanded: UUID?

    var body: some View {
        WillowScreen(title: "Toolkit", subtitle: "Plans written or approved by \(store.therapistName).") {
            ForEach(store.copingStrategies) { strategy in
                StrategyCard(
                    strategy: strategy,
                    isExpanded: expanded == strategy.id
                ) {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                        expanded = expanded == strategy.id ? nil : strategy.id
                    }
                }
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundColor(store.theme.brand)
                        Text("Therapist controlled")
                            .willowFont(store, size: 15, weight: .semibold)
                            .foregroundColor(store.theme.text)
                    }
                    Text("The AI can surface these plans when relevant, but it must not create new coping advice on its own.")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
            }
        }
        .navigationTitle("Toolkit")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct StrategyCard: View {
    @EnvironmentObject private var store: AppStore
    let strategy: CopingStrategy
    let isExpanded: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            WillowCard {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(store.theme.brand.opacity(0.1))
                                .frame(width: 38, height: 38)
                            Image(systemName: iconFor(strategy.title))
                                .foregroundColor(store.theme.brand)
                                .font(.system(size: 16))
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(strategy.title)
                                .willowFont(store, size: 16, weight: .semibold)
                                .foregroundColor(store.theme.text)
                            Text(strategy.therapistAuthored ? "From \(store.therapistName)" : "Draft")
                                .willowFont(store, size: 12)
                                .foregroundColor(store.theme.muted)
                        }
                        Spacer()
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(store.theme.muted)
                    }

                    if isExpanded {
                        Text(strategy.body)
                            .willowFont(store, size: 15)
                            .foregroundColor(store.theme.muted)
                            .padding(.top, 14)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        }
        .buttonStyle(.plain)
    }

    private func iconFor(_ title: String) -> String {
        if title.localizedCaseInsensitiveContains("Breath") { return "wind" }
        if title.localizedCaseInsensitiveContains("Ground") { return "figure.stand" }
        if title.localizedCaseInsensitiveContains("Thought") { return "text.bubble" }
        if title.localizedCaseInsensitiveContains("Sleep") { return "moon.zzz.fill" }
        return "heart.fill"
    }
}
