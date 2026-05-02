//
//  CrisisDetectionService.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import Foundation

class CrisisDetectionService {
    
    // A simple, non-exhaustive list of keywords.
    // This should be expanded and refined. A more robust solution might use
    // a combination of keyword matching and semantic analysis.
    private let crisisKeywords: [String] = [
        "suicide", "kill myself", "want to die", "self harm", "self-harm",
        "ending my life", "end it all", "can't go on"
    ]
    
    /// Checks a message for crisis-related keywords.
    /// - Parameter message: The user's input text.
    /// - Returns: `true` if a crisis keyword is found, `false` otherwise.
    func isCrisis(message: String) -> Bool {
        let lowercasedMessage = message.lowercased()
        for keyword in crisisKeywords {
            if lowercasedMessage.contains(keyword) {
                return true
            }
        }
        return false
    }
}
