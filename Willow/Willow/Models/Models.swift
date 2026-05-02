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
    var text: String
    let timestamp: Date

    init(id: UUID = UUID(), isUser: Bool, text: String, timestamp: Date = Date()) {
        self.id        = id
        self.isUser    = isUser
        self.text      = text
        self.timestamp = timestamp
    }
}

enum ConversationPhase: Equatable {
    case active, ended
}

enum PatientTab: String, CaseIterable, Identifiable {
    case home = "Home"
    case checkIn = "Check-in"
    case chat = "Chat"
    case reminders = "Reminders"
    case settings = "Settings"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .home: return "house"
        case .checkIn: return "sun.max"
        case .chat: return "message"
        case .reminders: return "bell"
        case .settings: return "gearshape"
        }
    }

    var selectedIcon: String {
        switch self {
        case .home: return "house.fill"
        case .checkIn: return "sun.max.fill"
        case .chat: return "message.fill"
        case .reminders: return "bell.fill"
        case .settings: return "gearshape.fill"
        }
    }
}

enum DisplayMode: String, CaseIterable, Identifiable {
    case light = "Light"
    case dark = "Dark"
    case night = "Sleep"
    case automatic = "Auto"

    var id: String { rawValue }

    var description: String {
        switch self {
        case .light: return "Warm off-white for daytime use."
        case .dark: return "Low-glare teal-black for evening comfort."
        case .night: return "Amber sleep palette with very low blue light."
        case .automatic: return "Follows system appearance and shifts to Sleep after 10pm."
        }
    }
}

enum AppFontOption: String, CaseIterable, Identifiable {
    case system = "System"
    case nunito = "Nunito"
    case georgia = "Georgia"
    case lexend = "Lexend"
    case openDyslexic = "OpenDyslexic"

    var id: String { rawValue }

    var subtitle: String {
        switch self {
        case .system: return "Phone default; familiar and safest as the starting point."
        case .nunito: return "Rounded, calm, and friendly."
        case .georgia: return "Serif option for a more grounded reading feel."
        case .lexend: return "Clear spacing for accessibility."
        case .openDyslexic: return "Optional dyslexia-friendly style when installed."
        }
    }

    var fontName: String? {
        switch self {
        case .system: return nil
        case .nunito: return "Avenir Next"
        case .georgia: return "Georgia"
        case .lexend: return "Verdana"
        case .openDyslexic: return "OpenDyslexic"
        }
    }
}

struct AppTheme {
    let brand: Color
    let brandLight: Color
    let background: Color
    let card: Color
    let cardAlt: Color
    let text: Color
    let muted: Color
    let border: Color
    let amber: Color
    let red: Color
    let purple: Color

    init(mode: DisplayMode, highContrast: Bool = false) {
        let resolvedMode: DisplayMode
        if mode == .automatic {
            let hour = Calendar.current.component(.hour, from: Date())
            resolvedMode = (hour >= 22 || hour < 7) ? .night : .light
        } else {
            resolvedMode = mode
        }

        switch resolvedMode {
        case .light, .automatic:
            brand = Color(red: 0.24, green: 0.55, blue: 0.43)
            brandLight = Color(red: 0.35, green: 0.68, blue: 0.56)
            background = highContrast ? .white : Color(red: 0.97, green: 0.96, blue: 0.94)
            card = .white
            cardAlt = Color(red: 0.92, green: 0.96, blue: 0.93)
            text = Color(red: 0.11, green: 0.17, blue: 0.15)
            muted = Color(red: 0.42, green: 0.48, blue: 0.46)
            border = Color(red: 0.89, green: 0.87, blue: 0.82)
            amber = Color(red: 0.85, green: 0.49, blue: 0.10)
            red = Color(red: 0.72, green: 0.24, blue: 0.24)
            purple = Color(red: 0.47, green: 0.35, blue: 0.72)
        case .dark:
            brand = Color(red: 0.42, green: 0.78, blue: 0.65)
            brandLight = Color(red: 0.55, green: 0.86, blue: 0.75)
            background = Color(red: 0.04, green: 0.09, blue: 0.08)
            card = Color(red: 0.08, green: 0.14, blue: 0.13)
            cardAlt = Color(red: 0.11, green: 0.19, blue: 0.17)
            text = Color(red: 0.93, green: 0.96, blue: 0.94)
            muted = Color(red: 0.62, green: 0.70, blue: 0.67)
            border = Color(red: 0.16, green: 0.25, blue: 0.22)
            amber = Color(red: 0.93, green: 0.62, blue: 0.26)
            red = Color(red: 0.88, green: 0.39, blue: 0.39)
            purple = Color(red: 0.65, green: 0.55, blue: 0.88)
        case .night:
            brand = Color(red: 0.87, green: 0.56, blue: 0.22)
            brandLight = Color(red: 0.96, green: 0.70, blue: 0.36)
            background = Color(red: 0.07, green: 0.05, blue: 0.04)
            card = Color(red: 0.13, green: 0.09, blue: 0.07)
            cardAlt = Color(red: 0.20, green: 0.13, blue: 0.08)
            text = Color(red: 0.96, green: 0.88, blue: 0.77)
            muted = Color(red: 0.74, green: 0.62, blue: 0.49)
            border = Color(red: 0.29, green: 0.20, blue: 0.12)
            amber = Color(red: 0.96, green: 0.66, blue: 0.24)
            red = Color(red: 0.72, green: 0.31, blue: 0.25)
            purple = Color(red: 0.70, green: 0.52, blue: 0.74)
        }
    }
}

struct CopingStrategy: Identifiable {
    let id: UUID
    let title: String
    let body: String
    let therapistAuthored: Bool

    init(id: UUID = UUID(), title: String, body: String, therapistAuthored: Bool = true) {
        self.id = id
        self.title = title
        self.body = body
        self.therapistAuthored = therapistAuthored
    }
}

struct MedicationReminder: Identifiable {
    let id: UUID
    let name: String
    let dose: String
    let time: Date
    let instructions: String
    let prescriber: String
    var isTakenToday: Bool

    init(id: UUID = UUID(), name: String, dose: String, time: Date, instructions: String, prescriber: String, isTakenToday: Bool) {
        self.id = id
        self.name = name
        self.dose = dose
        self.time = time
        self.instructions = instructions
        self.prescriber = prescriber
        self.isTakenToday = isTakenToday
    }
}

struct WellnessReminder: Identifiable {
    let id: UUID
    var title: String
    var icon: String
    var time: Date
    var days: Set<Int>
    var isEnabled: Bool

    init(id: UUID = UUID(), title: String, icon: String, time: Date, days: Set<Int>, isEnabled: Bool) {
        self.id = id
        self.title = title
        self.icon = icon
        self.time = time
        self.days = days
        self.isEnabled = isEnabled
    }
}

struct SessionSlot: Identifiable {
    let id = UUID()
    let label: String
    let type: String
}

struct PatternInsight: Identifiable {
    let id = UUID()
    let title: String
    let detail: String
    let confidence: String
    let sourceCount: Int
}

struct WillowGift: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let earned: Bool
}

struct MoodTrendPoint: Identifiable {
    let id = UUID()
    let day: String
    let mood: MoodLevel
}

struct ActivityDay: Identifiable {
    let id = UUID()
    let day: String
    let steps: Int
}

extension Date {
    static func todayAt(hour: Int, minute: Int = 0) -> Date {
        Calendar.current.date(bySettingHour: hour, minute: minute, second: 0, of: Date()) ?? Date()
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
