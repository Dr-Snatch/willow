import SwiftUI

struct PatientHistoryView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "History", subtitle: "Up, down, and still forward.") {
            moodCard
            activityCard
            insightCard
            checkInList
        }
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var moodCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 14) {
                SectionLabel("Mood trend", detail: "7 days")
                MoodTrendStrip(points: store.moodTrend)
                Text("Dips are kept visible because they are part of the longitudinal picture, not a failure state.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
            }
        }
    }

    private var activityCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    SectionLabel("Activity", detail: store.stepSharingEnabled ? "Shared" : "Private")
                    Spacer()
                }
                ActivityBarChart(days: store.activityWeek)
                Text("Steps are used only as optional context. GPS is not requested.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
            }
        }
    }

    private var insightCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Candidate observations", detail: "Requires review")
            ForEach(store.candidateInsights) { insight in
                WillowCard {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(insight.title)
                            .willowFont(store, size: 16, weight: .semibold)
                            .foregroundColor(store.theme.text)
                        Text(insight.detail)
                            .willowFont(store, size: 13)
                            .foregroundColor(store.theme.muted)
                        HStack {
                            PillLabel(text: "\(insight.sourceCount) sources", systemImage: "doc.text.magnifyingglass", tint: store.theme.brand)
                            PillLabel(text: insight.confidence, systemImage: "gauge.medium", tint: store.theme.amber)
                        }
                    }
                }
            }
        }
    }

    private var checkInList: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Recent check-ins")
            ForEach(store.checkIns.prefix(5)) { checkIn in
                WillowCard {
                    HStack(alignment: .top, spacing: 12) {
                        Text(checkIn.mood.emoji)
                            .font(.system(size: 26))
                        VStack(alignment: .leading, spacing: 4) {
                            Text(checkIn.date, format: .dateTime.weekday(.wide).month().day())
                                .willowFont(store, size: 13, weight: .semibold)
                                .foregroundColor(store.theme.muted)
                            Text(checkIn.note)
                                .willowFont(store, size: 14)
                                .foregroundColor(store.theme.text)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
    }
}
