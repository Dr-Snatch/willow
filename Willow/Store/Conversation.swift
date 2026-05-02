//
//  Conversation.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import Foundation

@MainActor
class Conversation: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading: Bool = false
    
    private let claudeService = ClaudeService()
    
    // Principle 01: Generous whitespace & pacing
    private let initialMessage = Message(
        text: "I'm here to listen. What's on your mind?",
        sender: .ai,
        register: .warmListening
    )
    
    init() {
        messages.append(initialMessage)
    }
    
    func sendMessage(_ text: String) {
        let userMessage = Message(text: text, sender: .user, register: .warmListening)
        messages.append(userMessage)
        
        isLoading = true
        
        Task {
            do {
                let responseText = try await claudeService.getResponse(for: messages)
                let aiMessage = Message(text: responseText, sender: .ai, register: .warmListening) // register can be dynamic later
                messages.append(aiMessage)
            } catch {
                let errorMessage = Message(text: "Sorry, I'm having trouble connecting. Please try again later.", sender: .ai, register: .safety)
                messages.append(errorMessage)
            }
            isLoading = false
        }
    }
}
