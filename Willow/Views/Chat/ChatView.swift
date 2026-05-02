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

    var body: some View {
        HStack {
            if isFromUser {
                Spacer()
            }
            Text(message)
                .padding(12)
                .background(isFromUser ? Color.blue.opacity(0.9) : Color.gray.opacity(0.3))
                .foregroundColor(isFromUser ? .white : .primary)
                .cornerRadius(16)
            if !isFromUser {
                Spacer()
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}


struct ChatView: View {
    // For the message input
    @State private var inputText: String = ""

    // Dummy messages for layout
    let messages = [
        ("That sounds exhausting", false),
        ("It really is. I can't seem to catch a break.", true),
        ("I want to sit with what you just said for a moment.", false),
        ("I appreciate that.", true)
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Scrollable conversation view
            ScrollView {
                VStack(spacing: 8) {
                    // This is where messages will go
                    ForEach(messages, id: \.0) { msg, isUser in
                        MessageBubble(message: msg, isFromUser: isUser)
                    }
                }
                .padding(.top)
            }

            // Message Input
            HStack(spacing: 16) {
                TextField("Start typing...", text: $inputText)
                    .padding(12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(16)
                
                Button(action: {
                    // Send action
                    print("Send message: \(inputText)")
                    inputText = ""
                }) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.largeTitle)
                        .foregroundColor(.blue)
                }
            }
            .padding()
            .background(.bar) // Use a background that adapts to light/dark mode
        }
        .navigationTitle("MindBridge")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationView {
        ChatView()
    }
}
