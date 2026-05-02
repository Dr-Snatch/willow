import SwiftUI

struct CopingStrategiesView: View {
    @EnvironmentObject var store: AppStore
    @State private var expanded: UUID?

    var body: some View {
        ZStack {
            Color.brandBg.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Your Toolkit")
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundColor(.brandText)
                        Text("Strategies from Dr. Rivera")
                            .font(.system(size: 15))
                            .foregroundColor(.brandMuted)
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 24)

                    VStack(spacing: 12) {
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
                    }

                    Text("Your therapist can update these between sessions.")
                        .font(.system(size: 13))
                        .foregroundColor(.brandMuted)
                        .padding(.top, 20)
                        .padding(.bottom, 32)
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

struct StrategyCard: View {
    let strategy: CopingStrategy
    let isExpanded: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.brand.opacity(0.1))
                            .frame(width: 36, height: 36)
                        Image(systemName: iconFor(strategy.title))
                            .foregroundColor(.brand)
                            .font(.system(size: 15))
                    }
                    Text(strategy.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.brandText)
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.brandMuted)
                }
                .padding(16)

                if isExpanded {
                    Text(strategy.body)
                        .font(.system(size: 15))
                        .foregroundColor(.brandMuted)
                        .padding(.horizontal, 16)
                        .padding(.bottom, 16)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .background(Color.brandCard)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }

    private func iconFor(_ title: String) -> String {
        if title.contains("Breath") { return "wind" }
        if title.contains("Ground") { return "figure.stand" }
        if title.contains("Thought") { return "text.bubble" }
        return "heart.fill"
    }
}

#Preview {
    CopingStrategiesView().environmentObject(AppStore())
}
