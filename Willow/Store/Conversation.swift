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
    @Published var isCrisis: Bool = false
    
    private let claudeService = ClaudeService()
    private let crisisDetectionService = CrisisDetectionService()
    
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
        
        if crisisDetectionService.isCrisis(message: text) {
            let crisisMessage = Message(text: "It sounds like you're going through a lot. For immediate support, it's best to connect with a crisis service.", sender: .ai, register: .safety)
            messages.append(crisisMessage)
            isCrisis = true // Trigger navigation to a crisis view
            return
        }
        
        isLoading = true
        
        Task {
            do {
                let responseText = try await claudeService.getResponse(for: messages)
                let aiMessage = Message(text: responseText, sender: .ai, register: .warmListening)
                messages.append(aiMessage)
            } catch {
                let errorMessage = Message(text: "Sorry, I'm having trouble connecting. Please try again later.", sender: .ai, register: .safety)
                messages.append(errorMessage)
            }
            isLoading = false
        }
    }
}
