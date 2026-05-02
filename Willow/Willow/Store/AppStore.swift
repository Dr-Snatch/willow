import Foundation

class AppStore: ObservableObject {
    @Published var userName: String = ""
    @Published var hasOnboarded: Bool = false
    @Published var checkIns: [CheckIn] = CheckIn.mockData
    @Published var messages: [ChatMessage] = []
    @Published var copingStrategies: [CopingStrategy] = CopingStrategy.mockData
    @Published var isAITyping: Bool = false
    @Published var conversationPhase: ConversationPhase = .active
    @Published var showCrisisSheet: Bool = false

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
            conversationPhase = .ended
        }
    }

    func startNewConversation() {
        messages = []
        conversationPhase = .active
    }
}
