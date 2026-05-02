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
        
        // TODO: AI response will be added here
    }
}
