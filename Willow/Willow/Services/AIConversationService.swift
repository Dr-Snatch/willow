import Foundation

final class AIConversationService {
    static let shared = AIConversationService()
    private init() {}

    private let systemPrompt = """
    You are a reflective journaling companion within Willow, a mental health app for people in active therapy.

    Your role is to help users explore and articulate their inner world — not to advise, fix, or interpret. \
    You are a present, thoughtful listener who helps people go deeper than they would alone.

    How to engage:
    — Respond warmly and naturally. This should feel like talking to someone who is genuinely present.
    — Ask one focused, open-ended question at a time. Never ask two questions at once.
    — Go beneath the surface. If someone says "I've been stressed", explore what's underneath — \
    what specifically feels hard, what it's connected to, what makes it difficult to carry.
    — Reflect back what you hear before moving forward. Show that you've genuinely listened.
    — Keep responses focused: 2–4 sentences of reflection, then one question.
    — Follow the thread the user opens, not the thread you assume is important.

    Hard limits — never break these:
    — Do not give advice, suggestions, or coping strategies of any kind.
    — Do not diagnose, label, or suggest what someone's experience means clinically.
    — Do not position yourself as a therapist, friend, or support worker.
    — If someone asks for advice or solutions, say exactly: \
    "That sounds really important — it might be worth bringing to your therapist."

    Ending the conversation:
    — After the user has genuinely explored a topic (usually 6–10 exchanges), look for a natural close: \
    they sound lighter, have named something real, or the thread feels complete.
    — End with something warm and specific — name one genuine thing they've reflected on, \
    and leave them feeling heard.
    — When you are ready to close, append <<END>> on a new line at the very end of your message. \
    Do not include <<END>> at any other point in the conversation.
    """

    // Returns a stream of text chunks. The caller is responsible for detecting <<END>>.
    nonisolated func stream(messages: [ChatMessage]) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            Task.detached {
                do {
                    let request = try self.buildRequest(messages: messages)
                    let (bytes, response) = try await URLSession.shared.bytes(for: request)

                    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
                        let code = (response as? HTTPURLResponse)?.statusCode ?? 0
                        throw AIError.badResponse(code)
                    }

                    for try await line in bytes.lines {
                        guard line.hasPrefix("data: ") else { continue }
                        let json = String(line.dropFirst(6))
                        guard json != "[DONE]" else { break }

                        if let data = json.data(using: .utf8),
                           let event = try? JSONDecoder().decode(StreamEvent.self, from: data),
                           event.type == "content_block_delta",
                           let chunk = event.delta?.text {
                            continuation.yield(chunk)
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }

    private func buildRequest(messages: [ChatMessage]) throws -> URLRequest {
        guard let url = URL(string: "https://api.anthropic.com/v1/messages") else {
            throw AIError.badResponse(0)
        }

        let apiMessages = messages.map {
            ["role": $0.isUser ? "user" : "assistant", "content": $0.text]
        }

        let body: [String: Any] = [
            "model": APIConfig.conversationModel,
            "max_tokens": 600,
            "temperature": 0.7,
            "system": systemPrompt,
            "messages": apiMessages,
            "stream": true
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(APIConfig.anthropicAPIKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        return request
    }
}

// MARK: - SSE parsing
private struct StreamEvent: Decodable {
    let type: String
    let delta: Delta?

    struct Delta: Decodable {
        let type: String?
        let text: String?
    }
}

// MARK: - Errors
enum AIError: LocalizedError {
    case badResponse(Int)

    var errorDescription: String? {
        switch self {
        case .badResponse(let code) where code == 0:
            return "Couldn't reach Willow. Check your connection."
        case .badResponse(let code):
            return "Willow returned an unexpected response (\(code))."
        }
    }
}
