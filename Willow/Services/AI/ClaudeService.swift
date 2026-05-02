//
//  ClaudeService.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import Foundation

// MARK: - Anthropic API Request/Response Structures

struct AnthropicRequest: Codable {
    let model: String
    let system: String
    let messages: [AnthropicMessage]
    let maxTokens: Int
    
    enum CodingKeys: String, CodingKey {
        case model, system, messages
        case maxTokens = "max_tokens"
    }
}

struct AnthropicMessage: Codable {
    let role: String
    let content: String
}

struct AnthropicResponse: Codable {
    let content: [ResponseContent]
}

struct ResponseContent: Codable {
    let text: String
}

// MARK: - ClaudeService

class ClaudeService {
    
    private let apiURL = URL(string: "https://api.anthropic.com/v1/messages")!
    
    // IMPORTANT: API Key should be stored securely, not hardcoded.
    // Add it to a `Secrets.plist` file and add that to .gitignore.
    private var apiKey: String {
        guard let path = Bundle.main.path(forResource: "Secrets", ofType: "plist"),
              let dict = NSDictionary(contentsOfFile: path),
              let key = dict["AnthropicAPIKey"] as? String else {
            fatalError("API Key not found in Secrets.plist")
        }
        return key
    }
    
    /// Generates the system prompt based on the project spec.
    private func systemPrompt(for mood: Double, sleep: Double) -> String {
        // This can be expanded with more dynamic data later.
        let trend = "stable" // Placeholder
        
        return """
        You are MindBridge, a supportive wellbeing companion for university students.
        Your role is to listen, reflect, and help the student identify the right level
        of support. You never diagnose, prescribe, or make clinical assessments.

        Context: Student reported mood score \(mood)/5, sleep quality \(sleep)/10,
        7-day trend: \(trend).
        
        Every response must reflect the following design principles:

        WHITESPACE & PACING
        Use generous spacing between ideas. Never produce walls of text. After any supportive statement, pause before continuing. Responses should feel calm and spacious — not clinical or rushed.

        EDITORIAL TONE
        Open directly with substance — never use filler phrases ("Certainly!", "Of course!"). Vary sentence length deliberately: short sentences for grounding, longer ones for reflection.

        DIRECTIONAL HIERARCHY
        Structure every response: acknowledgement → reflection → invitation. Ask only one question per message.

        MICRO-PRESENCE
        Use second-person grounding ("you mentioned," "what you described"). Name what you notice without diagnosing ("that sounds exhausting" — never "you seem depressed").

        REGISTER TRANSITIONS
        Signal clearly when shifting from listening to practical information. Warn gently: "I want to share something — feel free to ignore it if it's not the right moment." In safety-critical moments, be warm but unambiguous.

        HUMAN AGENCY
        Never tell the user what they feel, need, or should do. Offer frames, not conclusions ("some people find..." not "you should...").
        """
    }

    func getResponse(for messages: [Message], mood: Double, sleep: Double) async throws -> String {
        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.addValue("2024-04-04", forHTTPHeaderField: "x-api-version")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(apiKey, forHTTPHeaderField: "x-api-key")

        let anthropicMessages = messages.map { AnthropicMessage(role: $0.sender == .user ? "user" : "assistant", content: $0.text) }
        
        let requestBody = AnthropicRequest(
            model: "claude-3-sonnet-20240229",
            system: systemPrompt(for: mood, sleep: sleep),
            messages: anthropicMessages,
            maxTokens: 1024
        )
        
        request.httpBody = try JSONEncoder().encode(requestBody)

        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            // You can decode the error message from Anthropic here for better debugging
            throw URLError(.badServerResponse)
        }
        
        let decodedResponse = try JSONDecoder().decode(AnthropicResponse.self, from: data)
        return decodedResponse.content.first?.text ?? ""
    }
}
