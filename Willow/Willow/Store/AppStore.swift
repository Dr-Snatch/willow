import Foundation
import Combine

@MainActor
class AppStore: ObservableObject {
    @Published var userName: String = ""
    @Published var hasOnboarded: Bool = false
    @Published var selectedTab: PatientTab = .home
    @Published var checkIns: [CheckIn] = CheckIn.mockData
    @Published var messages: [ChatMessage] = []
    @Published var copingStrategies: [CopingStrategy] = CopingStrategy.mockData
    @Published var isAITyping: Bool = false
    @Published var conversationPhase: ConversationPhase = .active
    @Published var personalContext: PersonalContext = PersonalContext()
    @Published var showCrisisSheet: Bool = false
    @Published var displayMode: DisplayMode = .light
    @Published var fontOption: AppFontOption = .system
    @Published var textScale: Double = 1.0
    @Published var highContrast: Bool = false
    @Published var reduceMotion: Bool = false
    @Published var therapistLinked: Bool = true
    @Published var therapistName: String = "Dr. Rivera"
    @Published var inviteCode: String = "RIVERA7"
    @Published var chatSharingEnabled: Bool = true
    @Published var stepSharingEnabled: Bool = true
    @Published var moodSharingEnabled: Bool = true
    @Published var notificationsEnabled: Bool = true
    @Published var quietHoursEnabled: Bool = true
    @Published var medicationReminders: [MedicationReminder] = [
        MedicationReminder(
            name: "Sertraline",
            dose: "50mg",
            time: .todayAt(hour: 8, minute: 30),
            instructions: "Take once daily with water.",
            prescriber: "Dr. Rivera",
            isTakenToday: true
        ),
        MedicationReminder(
            name: "Vitamin D",
            dose: "1000 IU",
            time: .todayAt(hour: 19),
            instructions: "Take with food if possible.",
            prescriber: "Dr. Rivera",
            isTakenToday: false
        )
    ]
    @Published var wellnessReminders: [WellnessReminder] = [
        WellnessReminder(title: "Evening walk", icon: "figure.walk", time: .todayAt(hour: 18), days: Set(1...7), isEnabled: true),
        WellnessReminder(title: "Daily check-in", icon: "sun.max", time: .todayAt(hour: 20, minute: 30), days: Set(1...7), isEnabled: true),
        WellnessReminder(title: "Wind down", icon: "moon.zzz", time: .todayAt(hour: 22), days: Set(1...7), isEnabled: true)
    ]
    @Published var stepGoal: Int = 6000
    @Published var willowCompanionEnabled: Bool = true
    @Published var growthPhraseEnabled: Bool = true
    @Published var willowWeekCount: Int = 5

    var theme: AppTheme {
        AppTheme(mode: displayMode, highContrast: highContrast)
    }

    var fontName: String? {
        fontOption.fontName
    }

    var textSizeAdjustment: CGFloat {
        CGFloat(textScale)
    }

    func completeOnboarding(name: String) {
        userName = name.isEmpty ? "there" : name
        hasOnboarded = true
    }

    func submitCheckIn(mood: MoodLevel, note: String) {
        checkIns.insert(CheckIn(mood: mood, note: note), at: 0)
    }

    func sendMessage(_ text: String) async {
        guard conversationPhase == .active else { return }

        // Synchronous crisis check — fires before any network call.
        if CrisisDetector.isCrisis(text) {
            showCrisisSheet = true
            return
        }

        messages.append(ChatMessage(isUser: true, text: text))
        isAITyping = true

        // Snapshot history to send (excludes the placeholder we're about to add).
        let historyToSend = messages

        // Add the AI response placeholder.
        let placeholder = ChatMessage(isUser: false, text: "")
        messages.append(placeholder)
        let responseIndex = messages.count - 1
        isAITyping = false

        var fullText = ""

        do {
            for try await chunk in AIConversationService.shared.stream(messages: historyToSend) {
                fullText += chunk
                messages[responseIndex].text = fullText
                    .replacingOccurrences(of: "\n<<END>>", with: "")
                    .replacingOccurrences(of: "<<END>>", with: "")
                    .trimmingCharacters(in: .whitespacesAndNewlines)
            }
        } catch {
            messages[responseIndex].text = "Something went wrong — please try again."
        }

        if fullText.contains("<<END>>") {
            conversationPhase = .processing
            let snapshot = messages
            let ctx = personalContext
            Task {
                let result = await InsightPipelineService.shared.run(conversation: snapshot, context: ctx)
                switch result {
                case .consensus(let insights):
                    self.conversationPhase = .ended(insights: insights)
                case .noConsensus:
                    self.conversationPhase = .noConsensus
                case .failed:
                    self.conversationPhase = .noConsensus
                }
            }
        }
    }

    func startNewConversation() {
        messages = []
        conversationPhase = .active
    }

    func toggleMedicationTaken(_ medication: MedicationReminder) {
        guard let index = medicationReminders.firstIndex(where: { $0.id == medication.id }) else { return }
        medicationReminders[index].isTakenToday.toggle()
    }

    func updateWellnessReminder(_ reminder: WellnessReminder) {
        guard let index = wellnessReminders.firstIndex(where: { $0.id == reminder.id }) else { return }
        wellnessReminders[index] = reminder
    }

    func addWellnessReminder(title: String, icon: String, time: Date, days: Set<Int>) {
        wellnessReminders.append(
            WellnessReminder(
                title: title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Custom reminder" : title,
                icon: icon,
                time: time,
                days: days,
                isEnabled: true
            )
        )
    }

    func submitInviteCode(_ code: String) {
        let trimmed = code.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty {
            inviteCode = trimmed.uppercased()
            therapistLinked = true
        }
    }

    var moodTrend: [MoodTrendPoint] {
        [
            MoodTrendPoint(day: "Mon", mood: .good),
            MoodTrendPoint(day: "Tue", mood: .okay),
            MoodTrendPoint(day: "Wed", mood: .bad),
            MoodTrendPoint(day: "Thu", mood: .good),
            MoodTrendPoint(day: "Fri", mood: .great),
            MoodTrendPoint(day: "Sat", mood: .okay),
            MoodTrendPoint(day: "Sun", mood: .good)
        ]
    }

    var activityWeek: [ActivityDay] {
        [
            ActivityDay(day: "Mon", steps: 7420),
            ActivityDay(day: "Tue", steps: 5130),
            ActivityDay(day: "Wed", steps: 2210),
            ActivityDay(day: "Thu", steps: 6810),
            ActivityDay(day: "Fri", steps: 8360),
            ActivityDay(day: "Sat", steps: 5900),
            ActivityDay(day: "Sun", steps: 4210)
        ]
    }

    var candidateInsights: [PatternInsight] {
        [
            PatternInsight(
                title: "Work mentions often precede anxiety",
                detail: "Appears in 4 of the last 7 entries. Marked as a candidate until reviewed.",
                confidence: "Medium",
                sourceCount: 2
            ),
            PatternInsight(
                title: "Sleep disruption appears before lower mood",
                detail: "Low-sleep notes and lower check-ins appear close together this week.",
                confidence: "Low",
                sourceCount: 2
            )
        ]
    }

    var willowGifts: [WillowGift] {
        [
            WillowGift(title: "Leaf pin", icon: "leaf.fill", earned: true),
            WillowGift(title: "Amber lantern", icon: "lamp.table.fill", earned: true),
            WillowGift(title: "Notebook", icon: "book.closed.fill", earned: true),
            WillowGift(title: "Rain charm", icon: "cloud.rain.fill", earned: false),
            WillowGift(title: "Moon ribbon", icon: "moon.fill", earned: false),
            WillowGift(title: "Tiny bridge", icon: "point.3.connected.trianglepath.dotted", earned: false)
        ]
    }

    var availableSessionSlots: [SessionSlot] {
        [
            SessionSlot(label: "Tue 5 May, 10:00", type: "Video"),
            SessionSlot(label: "Tue 5 May, 14:30", type: "In person"),
            SessionSlot(label: "Thu 7 May, 09:30", type: "Phone"),
            SessionSlot(label: "Fri 8 May, 16:00", type: "Video")
        ]
    }
}
