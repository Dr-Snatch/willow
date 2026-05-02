//
//  Message.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import Foundation

struct Message: Identifiable {
    let id = UUID()
    let text: String
    let sender: Sender
    let register: Register
}

enum Sender {
    case user
    case ai
}

// Principle 05: Purposeful colour logic
enum Register {
    case warmListening // Default
    case informational // Sharing a resource
    case safety // Crisis or risk
}
