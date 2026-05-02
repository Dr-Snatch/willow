import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var store: AppStore
    @State private var selectedMood: MoodLevel = .okay
    @State private var note: String = ""
    @State private var submitted = false
    @FocusState private var noteIsFocused: Bool

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:  return "Good morning"
        case 12..<17: return "Good afternoon"
        default:      return "Good evening"
        }
    }

    var body: some View {
        ZStack {
            Color.brandBg.ignoresSafeArea()

            if submitted {
                submittedView
            } else {
                checkInForm
            }
        }
    }

    // MARK: - Form
    private var checkInForm: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(greeting), \(store.userName).")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(.brandText)
                    Text(Date().formatted(date: .long, time: .omitted))
                        .font(.system(size: 15))
                        .foregroundColor(.brandMuted)
                }
                .padding(.top, 8)

                // Mood selector
                VStack(alignment: .leading, spacing: 16) {
                    Text("How are you feeling?")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.brandText)

                    HStack(spacing: 0) {
                        ForEach(MoodLevel.allCases, id: \.rawValue) { mood in
                            moodButton(mood)
                        }
                    }
                    .background(Color.brandCard)
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 2)

                    HStack {
                        Spacer()
                        Text(selectedMood.label)
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(selectedMood.color)
                        Spacer()
                    }
                }

                // Note
                VStack(alignment: .leading, spacing: 10) {
                    Text("What's on your mind?")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.brandText)

                    ZStack(alignment: .topLeading) {
                        if note.isEmpty {
                            Text("A sentence or two is enough…")
                                .font(.system(size: 16))
                                .foregroundColor(.brandMuted.opacity(0.7))
                                .padding(.top, 14)
                                .padding(.leading, 16)
                        }
                        TextEditor(text: $note)
                            .font(.system(size: 16))
                            .foregroundColor(.brandText)
                            .frame(minHeight: 100, maxHeight: 160)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .focused($noteIsFocused)
                    }
                    .background(Color.brandCard)
                    .cornerRadius(14)
                    .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 2)
                }

                // Recent mood strip
                if !store.checkIns.isEmpty {
                    recentMoodStrip
                }

                // Submit
                Button {
                    store.submitCheckIn(mood: selectedMood, note: note)
                    noteIsFocused = false
                    withAnimation { submitted = true }
                } label: {
                    Text("Log Check-in")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.brand)
                        .cornerRadius(14)
                }
                .padding(.bottom, 24)
            }
            .padding(.horizontal, 20)
        }
    }

    private func moodButton(_ mood: MoodLevel) -> some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                selectedMood = mood
            }
        } label: {
            VStack(spacing: 4) {
                Text(mood.emoji)
                    .font(.system(size: selectedMood == mood ? 34 : 26))
                    .scaleEffect(selectedMood == mood ? 1.1 : 1.0)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(selectedMood == mood ? mood.color.opacity(0.12) : Color.clear)
        }
        .buttonStyle(.plain)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: selectedMood)
    }

    private var recentMoodStrip: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("This week")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.brandMuted)

            HStack(spacing: 8) {
                ForEach(store.checkIns.prefix(7).reversed()) { checkIn in
                    VStack(spacing: 4) {
                        Text(checkIn.mood.emoji)
                            .font(.system(size: 20))
                        Text(checkIn.date, format: .dateTime.weekday(.abbreviated))
                            .font(.system(size: 10))
                            .foregroundColor(.brandMuted)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.vertical, 10)
            .padding(.horizontal, 12)
            .background(Color.brandCard)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
    }

    // MARK: - Submitted state
    private var submittedView: some View {
        VStack(spacing: 20) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.brand.opacity(0.12))
                    .frame(width: 100, height: 100)
                Image(systemName: "checkmark")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundColor(.brand)
            }

            Text("Logged \(selectedMood.emoji)")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.brandText)

            Text("Dr. Rivera will see your check-in\nbefore your next session.")
                .font(.system(size: 16))
                .foregroundColor(.brandMuted)
                .multilineTextAlignment(.center)

            Spacer()

            Button {
                withAnimation {
                    submitted = false
                    note = ""
                    selectedMood = .okay
                }
            } label: {
                Text("Done")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.brand)
            }
            .padding(.bottom, 40)
        }
        .transition(.opacity.combined(with: .scale))
    }
}

#Preview {
    CheckInView().environmentObject(AppStore())
}
