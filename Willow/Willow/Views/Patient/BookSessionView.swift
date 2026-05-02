import SwiftUI

struct BookSessionView: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedSlot: UUID?

    var body: some View {
        WillowScreen(title: "Book session", subtitle: "Choose from available times shared by \(store.therapistName).") {
            upcomingSession
            calendarPreview
            availableSlots
        }
        .navigationTitle("Book session")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var upcomingSession: some View {
        WillowCard {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(store.theme.brand.opacity(0.12))
                        .frame(width: 46, height: 46)
                    Image(systemName: "calendar")
                        .foregroundColor(store.theme.brand)
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("Upcoming")
                        .willowFont(store, size: 13, weight: .semibold)
                        .foregroundColor(store.theme.muted)
                    Text("Tue 5 May, 10:00")
                        .willowFont(store, size: 17, weight: .semibold)
                        .foregroundColor(store.theme.text)
                    Text("Video session with \(store.therapistName)")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
                Spacer()
            }
        }
    }

    private var calendarPreview: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel("May 2026")
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 8) {
                    ForEach(["M", "T", "W", "T", "F", "S", "S"], id: \.self) { day in
                        Text(day)
                            .willowFont(store, size: 11, weight: .semibold)
                            .foregroundColor(store.theme.muted)
                    }
                    ForEach(1...14, id: \.self) { day in
                        Text("\(day)")
                            .willowFont(store, size: 13, weight: day == 5 ? .bold : .regular)
                            .foregroundColor(day == 5 ? .white : store.theme.text)
                            .frame(width: 34, height: 34)
                            .background(day == 5 ? store.theme.brand : store.theme.cardAlt)
                            .clipShape(Circle())
                    }
                }
            }
        }
    }

    private var availableSlots: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Available slots")
            ForEach(store.availableSessionSlots) { slot in
                Button {
                    selectedSlot = slot.id
                } label: {
                    WillowCard {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(slot.label)
                                    .willowFont(store, size: 15, weight: .semibold)
                                    .foregroundColor(store.theme.text)
                                Text(slot.type)
                                    .willowFont(store, size: 13)
                                    .foregroundColor(store.theme.muted)
                            }
                            Spacer()
                            Image(systemName: selectedSlot == slot.id ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(selectedSlot == slot.id ? store.theme.brand : store.theme.muted)
                        }
                    }
                }
                .buttonStyle(.plain)
            }

            Button {
                selectedSlot = store.availableSessionSlots.first?.id
            } label: {
                Text("Request selected time")
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(store.theme.brand)
                    .cornerRadius(14)
            }
            .padding(.top, 4)
        }
    }
}
