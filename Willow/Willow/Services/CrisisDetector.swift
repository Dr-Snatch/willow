import Foundation

enum CrisisDetector {
    private static let phrases = [
        "suicide", "suicidal", "kill myself", "end my life", "want to die",
        "don't want to live", "no reason to live", "not worth living",
        "self harm", "self-harm", "hurt myself", "cut myself",
        "can't go on", "end it all", "better off dead"
    ]

    // Synchronous — must run before any API call.
    static func isCrisis(_ text: String) -> Bool {
        let lower = text.lowercased()
        return phrases.contains { lower.contains($0) }
    }
}
