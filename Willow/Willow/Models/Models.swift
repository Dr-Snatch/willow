import SwiftUI

// MARK: - Theme
extension Color {
    static let brand        = Color(red: 0.24, green: 0.55, blue: 0.43)
    static let brandLight   = Color(red: 0.35, green: 0.68, blue: 0.56)
    static let brandBg      = Color(red: 0.97, green: 0.96, blue: 0.94)
    static let brandCard    = Color.white
    static let brandText    = Color(red: 0.11, green: 0.17, blue: 0.15)
    static let brandMuted   = Color(red: 0.42, green: 0.48, blue: 0.46)
}

// MARK: - Mood
enum MoodLevel: Int, CaseIterable, Codable {
    case terrible = 1, bad, okay, good, great

    var emoji: String {
        switch self {
        case .terrible: return "😞"
        case .bad:      return "😕"
        case .okay:     return "😐"
        case .good:     return "🙂"
        case .great:    return "😄"
        }
    }

    var label: String {
        switch self {
        case .terrible: return "Terrible"
        case .bad:      return "Bad"
        case .okay:     return "Okay"
        case .good:     return "Good"
        case .great:    return "Great"
        }
    }

    var color: Color {
        switch self {
        case .terrible: return Color(red: 0.80, green: 0.30, blue: 0.30)
        case .bad:      return Color(red: 0.90, green: 0.50, blue: 0.30)
        case .okay:     return Color(red: 0.85, green: 0.75, blue: 0.25)
        case .good:     return Color(red: 0.35, green: 0.72, blue: 0.50)
        case .great:    return Color(red: 0.20, green: 0.60, blue: 0.45)
        }
    }
}

// MARK: - Models
struct CheckIn: Identifiable {
    let id: UUID
    let date: Date
    let mood: MoodLevel
    let note: String

    init(id: UUID = UUID(), date: Date = Date(), mood: MoodLevel, note: String) {
        self.id   = id
        self.date = date
        self.mood = mood
        self.note = note
    }
}

struct ChatMessage: Identifiable {
    let id: UUID
    let isUser: Bool
    let text: String
    let timestamp: Date

    init(id: UUID = UUID(), isUser: Bool, text: String, timestamp: Date = Date()) {
        self.id        = id
        self.isUser    = isUser
        self.text      = text
        self.timestamp = timestamp
    }
}

struct CopingStrategy: Identifiable {
    let id: UUID
    let title: String
    let body: String

    init(id: UUID = UUID(), title: String, body: String) {
        self.id    = id
        self.title = title
        self.body  = body
    }
}

// MARK: - Mock data
extension CheckIn {
    static var mockData: [CheckIn] {
        let cal   = Calendar.current
        let today = Date()
        func daysAgo(_ n: Int) -> Date { cal.date(byAdding: .day, value: -n, to: today)! }
        return [
            CheckIn(date: today,          mood: .good,     note: "Had a productive morning. Felt a bit anxious before the meeting but it went okay."),
            CheckIn(date: daysAgo(1),     mood: .okay,     note: "Tired. Work was stressful. Took a walk which helped."),
            CheckIn(date: daysAgo(2),     mood: .bad,      note: "Couldn't stop overthinking at night. Didn't sleep well."),
            CheckIn(date: daysAgo(3),     mood: .good,     note: "Session with Dr. Rivera was really helpful. Felt lighter after."),
            CheckIn(date: daysAgo(4),     mood: .great,    note: "Best day in a while. Spent time outside with friends."),
            CheckIn(date: daysAgo(5),     mood: .okay,     note: "Nothing special. Just got through the day."),
            CheckIn(date: daysAgo(6),     mood: .bad,      note: "Felt disconnected. Hard to explain."),
        ]
    }
}

extension CopingStrategy {
    static var mockData: [CopingStrategy] {[
        CopingStrategy(
            title: "5-4-3-2-1 Grounding",
            body: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Brings you back to the present moment when anxiety takes over."
        ),
        CopingStrategy(
            title: "Box Breathing",
            body: "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times. Use this before any situation that feels overwhelming."
        ),
        CopingStrategy(
            title: "Thought Record",
            body: "When a negative thought shows up: write it down, notice the feeling it creates, then ask — what's the evidence for and against this thought being true?"
        ),
    ]}
}
