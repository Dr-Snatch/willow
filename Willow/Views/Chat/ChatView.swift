//
//  ChatView.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import SwiftUI

// A single message bubble
struct MessageBubble: View {
    let message: String
    let isFromUser: Bool
    let register: Register

    var body: some View {
        HStack {
            if isFromUser {
                Spacer()
            }
            Text(message)
                .padding(12)
                .background(bubbleColor)
                .foregroundColor(isFromUser ? .white : .primary)
                .cornerRadius(16)
            if !isFromUser {
                Spacer()
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    private var bubbleColor: Color {
        if isFromUser {
            return Color.blue.opacity(0.9)
        }
        
        switch register {
        case .warmListening:
            return Color.gray.opacity(0.3)
        case .informational:
            return Color.blue.opacity(0.2)
        case .safety:
            return Color.orange.opacity(0.4)
        }
    }
}


struct ChatView: View {
    @ObservedObject var conversation: Conversation
    @State private var inputText: String = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { scrollViewProxy in
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(conversation.messages) { message in
                            MessageBubble(
                                message: message.text,
                                isFromUser: message.sender == .user,
                                register: message.register
                            )
                            .id(message.id)
                        }
                        
                        if conversation.isLoading {
                            MessageBubble(message: "...", isFromUser: false, register: .warmListening)
                        }
                    }
                    .padding(.top)
                }
                .onChange(of: conversation.messages.count) { _ in
                    // Auto-scroll to the bottom
                    if let lastMessage = conversation.messages.last {
                        scrollViewProxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }

            HStack(spacing: 16) {
                TextField("Start typing...", text: $inputText)
                    .padding(12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(16)
                
                Button(action: {
                    conversation.sendMessage(inputText)
                    inputText = ""
                }) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.largeTitle)
                        .foregroundColor(inputText.isEmpty ? .gray.opacity(0.5) : .blue)
                }
                .disabled(inputText.isEmpty)
            }
            .padding()
            .background(.bar)
        }
        .navigationTitle("MindBridge")
        .navigationBarTitleDisplayMode(.inline)
    }
}
#Preview {
    NavigationView {
        // We need to pass a conversation object for the preview to work
        ChatView(conversation: Conversation())
    }
}
