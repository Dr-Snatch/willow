import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var store: AppStore
    @State private var selectedMood: MoodLevel = .okay
    @State private var note: String = ""
    @State private var selectedTags: Set<String> = []
    @State private var submitted = false
    @FocusState private var noteIsFocused: Bool

    private let tags = ["Work", "Sleep", "Rumination", "Social", "Body", "Energy"]

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        default: return "Good evening"
        }
    }

    var body: some View {
        ZStack {
            store.theme.background.ignoresSafeArea()
            if submitted {
                submittedView
            } else {
                checkInForm
            }
        }
        .navigationTitle("Check-in")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var checkInForm: some View {
        WillowScreen(title: "\(greeting), \(store.userName.isEmpty ? "Maya" : store.userName).", subtitle: Date().formatted(date: .long, time: .omitted)) {
            moodSelector
            noteCard
            tagsCard
            recentMoodCard
            submitButton
        }
    }

    private var moodSelector: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 16) {
                SectionLabel("How are you feeling?")
                HStack(spacing: 0) {
                    ForEach(MoodLevel.allCases, id: \.rawValue) { mood in
                        Button {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                selectedMood = mood
                            }
                        } label: {
                            VStack(spacing: 4) {
                                Text(mood.emoji)
                                    .font(.system(size: selectedMood == mood ? 34 : 26))
                                    .scaleEffect(selectedMood == mood ? 1.1 : 1.0)
                                Text(mood.label)
                                    .willowFont(store, size: 10, weight: .medium)
                                    .foregroundColor(selectedMood == mood ? mood.color : store.theme.muted)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(selectedMood == mood ? mood.color.opacity(0.13) : Color.clear)
                            .cornerRadius(12)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var noteCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 10) {
                SectionLabel("What's on your mind?")
                ZStack(alignment: .topLeading) {
                    if note.isEmpty {
                        Text("A sentence or two is enough...")
                            .willowFont(store, size: 16)
                            .foregroundColor(store.theme.muted.opacity(0.75))
                            .padding(.top, 10)
                            .padding(.leading, 6)
                    }
                    TextEditor(text: $note)
                        .willowFont(store, size: 16)
                        .foregroundColor(store.theme.text)
                        .scrollContentBackground(.hidden)
                        .frame(minHeight: 110, maxHeight: 170)
                        .focused($noteIsFocused)
                }
            }
        }
    }

    private var tagsCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel("Optional context")
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 96))], spacing: 8) {
                    ForEach(tags, id: \.self) { tag in
                        Button {
                            if selectedTags.contains(tag) {
                                selectedTags.remove(tag)
                            } else {
                                selectedTags.insert(tag)
                            }
                        } label: {
                            Text(tag)
                                .willowFont(store, size: 13, weight: .semibold)
                                .foregroundColor(selectedTags.contains(tag) ? .white : store.theme.brand)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 9)
                                .background(selectedTags.contains(tag) ? store.theme.brand : store.theme.brand.opacity(0.12))
                                .cornerRadius(18)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var recentMoodCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel("This week")
                HStack(spacing: 8) {
                    ForEach(store.checkIns.prefix(7).reversed()) { checkIn in
                        VStack(spacing: 4) {
                            Text(checkIn.mood.emoji)
                                .font(.system(size: 21))
                            Text(checkIn.date, format: .dateTime.weekday(.abbreviated))
                                .willowFont(store, size: 10)
                                .foregroundColor(store.theme.muted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }

    private var submitButton: some View {
        Button {
            let tagText = selectedTags.isEmpty ? "" : "\nTags: \(selectedTags.sorted().joined(separator: ", "))"
            store.submitCheckIn(mood: selectedMood, note: note + tagText)
            noteIsFocused = false
            withAnimation { submitted = true }
        } label: {
            Text("Log check-in")
                .willowFont(store, size: 17, weight: .semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(store.theme.brand)
                .cornerRadius(14)
        }
    }

    private var submittedView: some View {
        VStack(spacing: 20) {
            Spacer()
            ZStack {
                Circle()
                    .fill(store.theme.brand.opacity(0.12))
                    .frame(width: 100, height: 100)
                Image(systemName: "checkmark")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundColor(store.theme.brand)
            }
            Text("Logged \(selectedMood.emoji)")
                .willowFont(store, size: 24, weight: .bold)
                .foregroundColor(store.theme.text)
            Text("\(store.therapistName) will see this only according to your sharing settings.")
                .willowFont(store, size: 16)
                .foregroundColor(store.theme.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Spacer()
            Button {
                withAnimation {
                    submitted = false
                    note = ""
                    selectedTags = []
                    selectedMood = .okay
                }
            } label: {
                Text("Done")
                    .willowFont(store, size: 17, weight: .semibold)
                    .foregroundColor(store.theme.brand)
            }
            .padding(.bottom, 40)
        }
    }
}
