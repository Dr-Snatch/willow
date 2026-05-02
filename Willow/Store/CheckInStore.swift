//
//  CheckInStore.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import Foundation
import SwiftUI

@MainActor
class CheckInStore: ObservableObject {
    @Published var hasCheckedInToday: Bool = false
    @Published var latestCheckIn: CheckIn?

    // In a real app, you would persist and load this data.
    // For the MVP, we just manage the state in memory.

    func completeCheckIn(mood: Double, sleep: Double) {
        let newCheckIn = CheckIn(timestamp: Date(), mood: mood, sleep: sleep)
        latestCheckIn = newCheckIn
        hasCheckedInToday = true
        print("Checked in: Mood \(mood), Sleep \(sleep)")
    }
}
