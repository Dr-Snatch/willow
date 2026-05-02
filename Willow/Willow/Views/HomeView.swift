import SwiftUI

struct HomeView: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        TabView(selection: $store.selectedTab) {
            NavigationStack {
                PatientHomeView()
            }
            .tabItem {
                Label(
                    PatientTab.home.rawValue,
                    systemImage: store.selectedTab == .home ? PatientTab.home.selectedIcon : PatientTab.home.icon
                )
            }
            .tag(PatientTab.home)

            NavigationStack {
                CheckInView()
            }
            .tabItem {
                Label(
                    PatientTab.checkIn.rawValue,
                    systemImage: store.selectedTab == .checkIn ? PatientTab.checkIn.selectedIcon : PatientTab.checkIn.icon
                )
            }
            .tag(PatientTab.checkIn)

            NavigationStack {
                ChatView()
            }
            .tabItem {
                Label(
                    PatientTab.chat.rawValue,
                    systemImage: store.selectedTab == .chat ? PatientTab.chat.selectedIcon : PatientTab.chat.icon
                )
            }
            .tag(PatientTab.chat)

            NavigationStack {
                RemindersView()
            }
            .tabItem {
                Label(
                    PatientTab.reminders.rawValue,
                    systemImage: store.selectedTab == .reminders ? PatientTab.reminders.selectedIcon : PatientTab.reminders.icon
                )
            }
            .tag(PatientTab.reminders)

            NavigationStack {
                PatientSettingsView()
            }
            .tabItem {
                Label(
                    PatientTab.settings.rawValue,
                    systemImage: store.selectedTab == .settings ? PatientTab.settings.selectedIcon : PatientTab.settings.icon
                )
            }
            .tag(PatientTab.settings)
        }
        .tint(store.theme.brand)
        .toolbarBackground(store.theme.card, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
    }
}

struct PatientHomeView: View {
    @EnvironmentObject private var store: AppStore

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        default: return "Good evening"
        }
    }

    var body: some View {
        WillowScreen(
            title: "\(greeting), \(store.userName.isEmpty ? "Maya" : store.userName).",
            subtitle: "A quiet snapshot of your week between sessions."
        ) {
            todayCard
            quickActions
            weekOverview
            insightsPreview
            sessionCard
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var todayCard: some View {
        let theme = store.theme
        return WillowCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 8) {
                            Image(systemName: "leaf.fill")
                                .foregroundColor(theme.brand)
                            Text("Willow is growing with you")
                                .willowFont(store, size: 16, weight: .semibold)
                                .foregroundColor(theme.text)
                        }
                        Text("5 of 7 check-ins this week. Growth is longitudinal: up, down, and still forward.")
                            .willowFont(store, size: 14)
                            .foregroundColor(theme.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer()
                    NavigationLink {
                        WillowCompanionView()
                    } label: {
                        ZStack {
                            Circle()
                                .fill(theme.brand.opacity(0.12))
                                .frame(width: 58, height: 58)
                            Image(systemName: "tree.fill")
                                .font(.system(size: 28))
                                .foregroundColor(theme.brand)
                        }
                    }
                    .buttonStyle(.plain)
                }

                HStack(spacing: 8) {
                    ForEach(0..<7, id: \.self) { index in
                        Capsule()
                            .fill(index < store.willowWeekCount ? theme.brand : theme.cardAlt)
                            .frame(height: 9)
                    }
                }
            }
        }
    }

    private var quickActions: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            Button {
                store.selectedTab = .checkIn
            } label: {
                QuickActionCard(icon: "sun.max.fill", title: "Check in", subtitle: "Log mood")
            }
            .buttonStyle(.plain)

            Button {
                store.selectedTab = .chat
            } label: {
                QuickActionCard(icon: "message.fill", title: "Reflect", subtitle: "Journal with Willow")
            }
            .buttonStyle(.plain)

            NavigationLink {
                BookSessionView()
            } label: {
                QuickActionCard(icon: "calendar.badge.plus", title: "Book", subtitle: "Next session")
            }
            .buttonStyle(.plain)

            NavigationLink {
                PatientHistoryView()
            } label: {
                QuickActionCard(icon: "chart.bar.xaxis", title: "History", subtitle: "Patterns")
            }
            .buttonStyle(.plain)
        }
    }

    private var weekOverview: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 14) {
                SectionLabel("This week", detail: "Shared with consent")
                MoodTrendStrip(points: store.moodTrend)
                Divider().background(store.theme.border)
                HStack(spacing: 12) {
                    StatTile(title: "Steps", value: "5.7k", detail: "daily avg", icon: "figure.walk")
                    StatTile(title: "Medication", value: "86%", detail: "this week", icon: "pills.fill")
                }
            }
        }
    }

    private var insightsPreview: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Insight candidates", detail: "Not a diagnosis")
            ForEach(store.candidateInsights.prefix(2)) { insight in
                WillowCard {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(insight.title)
                                .willowFont(store, size: 15, weight: .semibold)
                                .foregroundColor(store.theme.text)
                            Spacer()
                            PillLabel(text: insight.confidence, systemImage: "checkmark.seal", tint: store.theme.amber)
                        }
                        Text(insight.detail)
                            .willowFont(store, size: 13)
                            .foregroundColor(store.theme.muted)
                    }
                }
            }
        }
    }

    private var sessionCard: some View {
        WillowCard {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(store.theme.brand.opacity(0.12))
                        .frame(width: 46, height: 46)
                    Image(systemName: "person.crop.circle.badge.checkmark")
                        .foregroundColor(store.theme.brand)
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("Next session")
                        .willowFont(store, size: 13, weight: .semibold)
                        .foregroundColor(store.theme.muted)
                    Text("Tue 5 May, 10:00 with \(store.therapistName)")
                        .willowFont(store, size: 15, weight: .semibold)
                        .foregroundColor(store.theme.text)
                }
                Spacer()
                NavigationLink {
                    BookSessionView()
                } label: {
                    Image(systemName: "chevron.right")
                        .foregroundColor(store.theme.muted)
                }
            }
        }
    }
}

struct QuickActionCard: View {
    @EnvironmentObject private var store: AppStore
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundColor(store.theme.brand)
                Text(title)
                    .willowFont(store, size: 15, weight: .semibold)
                    .foregroundColor(store.theme.text)
                Text(subtitle)
                    .willowFont(store, size: 12)
                    .foregroundColor(store.theme.muted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct StatTile: View {
    @EnvironmentObject private var store: AppStore
    let title: String
    let value: String
    let detail: String
    let icon: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(store.theme.brand)
            VStack(alignment: .leading, spacing: 1) {
                Text(value)
                    .willowFont(store, size: 17, weight: .bold)
                    .foregroundColor(store.theme.text)
                Text("\(title) · \(detail)")
                    .willowFont(store, size: 11)
                    .foregroundColor(store.theme.muted)
            }
            Spacer()
        }
        .padding(12)
        .background(store.theme.cardAlt)
        .cornerRadius(12)
    }
}
