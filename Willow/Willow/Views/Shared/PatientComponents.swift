import SwiftUI

extension View {
    func willowFont(_ store: AppStore, size: CGFloat, weight: Font.Weight = .regular) -> some View {
        let adjusted = size * store.textSizeAdjustment
        if let name = store.fontName {
            return AnyView(self.font(.custom(name, size: adjusted).weight(weight)))
        }
        return AnyView(self.font(.system(size: adjusted, weight: weight)))
    }
}

struct WillowScreen<Content: View>: View {
    @EnvironmentObject private var store: AppStore
    let title: String?
    let subtitle: String?
    let content: Content

    init(title: String? = nil, subtitle: String? = nil, @ViewBuilder content: () -> Content) {
        self.title = title
        self.subtitle = subtitle
        self.content = content()
    }

    var body: some View {
        let theme = store.theme
        ZStack {
            theme.background.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if let title {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(title)
                                .willowFont(store, size: 28, weight: .bold)
                                .foregroundColor(theme.text)
                            if let subtitle {
                                Text(subtitle)
                                    .willowFont(store, size: 15)
                                    .foregroundColor(theme.muted)
                            }
                        }
                        .padding(.top, 10)
                    }

                    content
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 28)
            }
        }
    }
}

struct WillowCard<Content: View>: View {
    @EnvironmentObject private var store: AppStore
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        let theme = store.theme
        content
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.card)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(theme.border, lineWidth: 1)
            )
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(store.displayMode == .light ? 0.05 : 0.18), radius: 6, x: 0, y: 2)
    }
}

struct SectionLabel: View {
    @EnvironmentObject private var store: AppStore
    let title: String
    let detail: String?

    init(_ title: String, detail: String? = nil) {
        self.title = title
        self.detail = detail
    }

    var body: some View {
        let theme = store.theme
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .willowFont(store, size: 17, weight: .semibold)
                .foregroundColor(theme.text)
            Spacer()
            if let detail {
                Text(detail)
                    .willowFont(store, size: 13, weight: .medium)
                    .foregroundColor(theme.muted)
            }
        }
    }
}

struct PillLabel: View {
    @EnvironmentObject private var store: AppStore
    let text: String
    let systemImage: String
    let tint: Color?

    var body: some View {
        let theme = store.theme
        HStack(spacing: 6) {
            Image(systemName: systemImage)
            Text(text)
        }
        .willowFont(store, size: 12, weight: .semibold)
        .foregroundColor(tint ?? theme.brand)
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background((tint ?? theme.brand).opacity(0.12))
        .cornerRadius(20)
    }
}

struct SettingsNavigationRow: View {
    @EnvironmentObject private var store: AppStore
    let icon: String
    let title: String
    let subtitle: String
    let tint: Color?

    var body: some View {
        let theme = store.theme
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill((tint ?? theme.brand).opacity(0.13))
                    .frame(width: 38, height: 38)
                Image(systemName: icon)
                    .foregroundColor(tint ?? theme.brand)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .willowFont(store, size: 15, weight: .semibold)
                    .foregroundColor(theme.text)
                Text(subtitle)
                    .willowFont(store, size: 12)
                    .foregroundColor(theme.muted)
                    .lineLimit(2)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(theme.muted)
        }
        .padding(.vertical, 6)
    }
}

struct MoodTrendStrip: View {
    @EnvironmentObject private var store: AppStore
    let points: [MoodTrendPoint]

    var body: some View {
        HStack(spacing: 7) {
            ForEach(points) { point in
                VStack(spacing: 5) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(point.mood.color)
                        .frame(height: CGFloat(point.mood.rawValue) * 12 + 14)
                    Text(point.day)
                        .willowFont(store, size: 10, weight: .medium)
                        .foregroundColor(store.theme.muted)
                }
                .frame(maxWidth: .infinity, maxHeight: 92, alignment: .bottom)
            }
        }
    }
}

struct ActivityBarChart: View {
    @EnvironmentObject private var store: AppStore
    let days: [ActivityDay]

    var maxSteps: Int {
        days.map(\.steps).max() ?? 1
    }

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ForEach(days) { day in
                VStack(spacing: 5) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(day.steps >= store.stepGoal ? store.theme.brand : store.theme.amber)
                        .frame(height: max(18, CGFloat(day.steps) / CGFloat(maxSteps) * 74))
                    Text(day.day.prefix(1))
                        .willowFont(store, size: 10, weight: .medium)
                        .foregroundColor(store.theme.muted)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 98)
    }
}

struct TimeButton: View {
    @EnvironmentObject private var store: AppStore
    let date: Date

    var body: some View {
        Text(date, format: .dateTime.hour().minute())
            .willowFont(store, size: 13, weight: .semibold)
            .foregroundColor(store.theme.brand)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(store.theme.brand.opacity(0.12))
            .cornerRadius(18)
    }
}

struct DayPicker: View {
    @EnvironmentObject private var store: AppStore
    @Binding var selectedDays: Set<Int>

    private let labels = ["M", "T", "W", "T", "F", "S", "S"]

    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...7, id: \.self) { day in
                Button {
                    if selectedDays.contains(day) {
                        selectedDays.remove(day)
                    } else {
                        selectedDays.insert(day)
                    }
                } label: {
                    Text(labels[day - 1])
                        .willowFont(store, size: 12, weight: .semibold)
                        .foregroundColor(selectedDays.contains(day) ? .white : store.theme.muted)
                        .frame(width: 34, height: 34)
                        .background(selectedDays.contains(day) ? store.theme.brand : store.theme.cardAlt)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
        }
    }
}
