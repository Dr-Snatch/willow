import SwiftUI

struct RemindersView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showingAddReminder = false

    var body: some View {
        WillowScreen(title: "Reminders", subtitle: "Medication timing follows the doctor's recommendation. Wellness reminders are yours to adjust.") {
            medicationSection
            wellnessSection
            stepGoalSection
        }
        .navigationTitle("Reminders")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingAddReminder = true
                } label: {
                    Image(systemName: "plus")
                        .foregroundColor(store.theme.brand)
                }
            }
        }
        .sheet(isPresented: $showingAddReminder) {
            NavigationStack {
                AddReminderView()
            }
        }
    }

    private var medicationSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                SectionLabel("Medication", detail: "Set by \(store.therapistName)")
                Spacer()
                Image(systemName: "lock.fill")
                    .foregroundColor(store.theme.muted)
            }
            ForEach(store.medicationReminders) { medication in
                NavigationLink {
                    MedicationDetailView(medication: medication)
                } label: {
                    WillowCard {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(store.theme.brand.opacity(0.12))
                                    .frame(width: 40, height: 40)
                                Image(systemName: "pills.fill")
                                    .foregroundColor(store.theme.brand)
                            }
                            VStack(alignment: .leading, spacing: 3) {
                                Text(medication.name)
                                    .willowFont(store, size: 15, weight: .semibold)
                                    .foregroundColor(store.theme.text)
                                Text("\(medication.dose) - \(medication.time.formatted(date: .omitted, time: .shortened))")
                                    .willowFont(store, size: 13)
                                    .foregroundColor(store.theme.muted)
                            }
                            Spacer()
                            Image(systemName: medication.isTakenToday ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(medication.isTakenToday ? store.theme.brand : store.theme.muted)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var wellnessSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Wellness reminders", detail: "Patient-controlled")
            ForEach($store.wellnessReminders) { $reminder in
                WillowCard {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(store.theme.brand.opacity(0.12))
                                    .frame(width: 40, height: 40)
                                Image(systemName: reminder.icon)
                                    .foregroundColor(store.theme.brand)
                            }
                            VStack(alignment: .leading, spacing: 3) {
                                Text(reminder.title)
                                    .willowFont(store, size: 15, weight: .semibold)
                                    .foregroundColor(store.theme.text)
                                Text(reminder.days.count == 7 ? "Every day" : "\(reminder.days.count) days a week")
                                    .willowFont(store, size: 12)
                                    .foregroundColor(store.theme.muted)
                            }
                            Spacer()
                            DatePicker("", selection: $reminder.time, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .tint(store.theme.brand)
                            Toggle("", isOn: $reminder.isEnabled)
                                .labelsHidden()
                                .tint(store.theme.brand)
                        }
                        DayPicker(selectedDays: $reminder.days)
                    }
                }
            }
            Button {
                showingAddReminder = true
            } label: {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Add reminder")
                }
                .willowFont(store, size: 15, weight: .semibold)
                .foregroundColor(store.theme.brand)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(store.theme.brand.opacity(0.12))
                .cornerRadius(14)
            }
        }
    }

    private var stepGoalSection: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel("Daily step goal", detail: store.stepSharingEnabled ? "Shared" : "Private")
                HStack {
                    Button {
                        store.stepGoal = max(1000, store.stepGoal - 500)
                    } label: {
                        Image(systemName: "minus.circle.fill")
                            .font(.system(size: 28))
                    }
                    .foregroundColor(store.theme.brand)

                    Text("\(store.stepGoal) steps")
                        .willowFont(store, size: 20, weight: .bold)
                        .foregroundColor(store.theme.text)
                        .frame(maxWidth: .infinity)

                    Button {
                        store.stepGoal = min(20000, store.stepGoal + 500)
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 28))
                    }
                    .foregroundColor(store.theme.brand)
                }
                Text("This uses step count only. Location is not requested.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
            }
        }
    }
}

struct MedicationDetailView: View {
    @EnvironmentObject private var store: AppStore
    let medication: MedicationReminder

    var currentMedication: MedicationReminder {
        store.medicationReminders.first(where: { $0.id == medication.id }) ?? medication
    }

    var body: some View {
        WillowScreen(title: currentMedication.name, subtitle: "Read-only prescription detail.") {
            WillowCard {
                VStack(alignment: .leading, spacing: 16) {
                    MedicationInfoRow(title: "Dose", value: currentMedication.dose)
                    MedicationInfoRow(title: "Time", value: currentMedication.time.formatted(date: .omitted, time: .shortened))
                    MedicationInfoRow(title: "Instructions", value: currentMedication.instructions)
                    MedicationInfoRow(title: "Set by", value: currentMedication.prescriber)
                }
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundColor(store.theme.muted)
                        Text("Timing is locked")
                            .willowFont(store, size: 16, weight: .semibold)
                            .foregroundColor(store.theme.text)
                    }
                    Text("To request a medication change, contact \(store.therapistName) or the prescribing clinician directly.")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
            }

            Button {
                store.toggleMedicationTaken(currentMedication)
            } label: {
                Text(currentMedication.isTakenToday ? "Marked as taken today" : "Mark as taken today")
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(store.theme.brand)
                    .cornerRadius(14)
            }
        }
        .navigationTitle(currentMedication.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct MedicationInfoRow: View {
    @EnvironmentObject private var store: AppStore
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .willowFont(store, size: 12, weight: .semibold)
                .foregroundColor(store.theme.muted)
            Text(value)
                .willowFont(store, size: 15)
                .foregroundColor(store.theme.text)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct AddReminderView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: AppStore
    @State private var title = ""
    @State private var selectedIcon = "sparkles"
    @State private var time = Date.todayAt(hour: 18)
    @State private var days = Set(1...7)
    @State private var searchText = ""

    private let icons = [
        "sparkles", "figure.walk", "wind", "drop.fill", "book.closed.fill", "heart.fill",
        "moon.zzz.fill", "cup.and.saucer.fill", "paintbrush.fill", "music.note", "phone.fill", "house.fill"
    ]

    var filteredIcons: [String] {
        if searchText.isEmpty { return icons }
        return icons.filter { $0.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        WillowScreen(title: "Add reminder", subtitle: "Choose an icon, title, time, and days.") {
            WillowCard {
                VStack(alignment: .leading, spacing: 14) {
                    SectionLabel("Icon")
                    TextField("Search symbols", text: $searchText)
                        .textFieldStyle(.roundedBorder)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 10) {
                        ForEach(filteredIcons, id: \.self) { icon in
                            Button {
                                selectedIcon = icon
                            } label: {
                                Image(systemName: icon)
                                    .font(.system(size: 22))
                                    .foregroundColor(selectedIcon == icon ? .white : store.theme.brand)
                                    .frame(height: 44)
                                    .frame(maxWidth: .infinity)
                                    .background(selectedIcon == icon ? store.theme.brand : store.theme.cardAlt)
                                    .cornerRadius(12)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 12) {
                    SectionLabel("Title")
                    TextField("Title", text: $title)
                        .textFieldStyle(.roundedBorder)
                    Text("\(title.count)/40 characters")
                        .willowFont(store, size: 12)
                        .foregroundColor(store.theme.muted)
                }
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 14) {
                    SectionLabel("Schedule")
                    DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute)
                        .tint(store.theme.brand)
                    DayPicker(selectedDays: $days)
                }
            }

            WillowCard {
                HStack(spacing: 12) {
                    Image(systemName: selectedIcon)
                        .foregroundColor(store.theme.brand)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(title.isEmpty ? "Custom reminder" : title)
                            .willowFont(store, size: 15, weight: .semibold)
                            .foregroundColor(store.theme.text)
                        Text("Time for: \(title.isEmpty ? "your reminder" : title)")
                            .willowFont(store, size: 12)
                            .foregroundColor(store.theme.muted)
                    }
                    Spacer()
                    TimeButton(date: time)
                }
            }

            Button {
                store.addWellnessReminder(title: String(title.prefix(40)), icon: selectedIcon, time: time, days: days)
                dismiss()
            } label: {
                Text("Save reminder")
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(store.theme.brand)
                    .cornerRadius(14)
            }
        }
        .navigationTitle("Add reminder")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Cancel") { dismiss() }
                    .foregroundColor(store.theme.brand)
            }
        }
    }
}
