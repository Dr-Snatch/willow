import Foundation
import Combine

class AppStore: ObservableObject {
    @Published var userName: String = ""
    @Published var hasOnboarded: Bool = false
    @Published var checkIns: [CheckIn] = CheckIn.mockData
    @Published var messages: [ChatMessage] = []
    @Published var copingStrategies: [CopingStrategy] = CopingStrategy.mockData
    @Published var isAITyping: Bool = false

    func completeOnboarding(name: String) {
        userName = name.isEmpty ? "there" : name
        hasOnboarded = true
    }

    func submitCheckIn(mood: MoodLevel, note: String) {
        checkIns.insert(CheckIn(mood: mood, note: note), at: 0)
    }

    func sendMessage(_ text: String) {
        messages.append(ChatMessage(isUser: true, text: text))
        isAITyping = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            self.isAITyping = false
            self.messages.append(ChatMessage(isUser: false, text: Self.mockResponse(for: text)))
        }
    }

    private static func mockResponse(for input: String) -> String {
        let l = input.lowercased()
        if l.contains("anxious") || l.contains("anxiety") || l.contains("worried") || l.contains("panic") {
            return "It sounds like anxiety is showing up for you right now — that makes sense, and it's okay.\n\nYour therapist left you a grounding exercise. Want to try the 5-4-3-2-1 technique together? It takes about two minutes."
        }
        if l.contains("sad") || l.contains("depress") || l.contains("down") || l.contains("empty") {
            return "I hear you. Feeling low can be exhausting, especially when there's no obvious reason.\n\nYou don't have to explain it. What's been taking up the most space in your mind today?"
        }
        if l.contains("hurt") || l.contains("harm") || l.contains("crisis") || l.contains("end it") || l.contains("suicide") {
            return "Thank you for telling me — that took courage. What you're feeling matters, and I want to make sure you're safe right now.\n\nI'm notifying Dr. Rivera. Please also reach out to the Crisis Text Line — text HOME to 741741 — or call or text 988."
        }
        if l.contains("good") || l.contains("better") || l.contains("happy") || l.contains("great") {
            return "That's really good to hear — it's worth pausing and actually noticing that.\n\nWhat do you think helped today? Even small things count."
        }
        if l.contains("sleep") || l.contains("tired") || l.contains("exhausted") {
            return "Sleep and mood are deeply connected — when one suffers, the other usually does too.\n\nHave you been able to wind down at all before bed lately, or does your mind stay busy?"
        }
        return "Thank you for sharing that with me.\n\nCan you tell me a little more about what's been going on? I'm here, and there's no rush."
    }
}
