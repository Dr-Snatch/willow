//
//  ContentView.swift
//  Willow
//
//  Created by Arthur  on 02/05/2026.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var conversation = Conversation()
    @StateObject private var checkInStore = CheckInStore()

    var body: some View {
        NavigationView {
            if checkInStore.hasCheckedInToday {
                if conversation.isCrisis {
                    CrisisView()
                } else {
                    ChatView(conversation: conversation)
                }
            } else {
                CheckInView(checkInStore: checkInStore)
            }
        }
        .onChange(of: checkInStore.latestCheckIn) { checkIn in
            // Pass check-in data to the conversation
            if let checkIn = checkIn {
                conversation.updateContext(mood: checkIn.mood, sleep: checkIn.sleep)
            }
        }
    }
}
#Preview {
    ContentView()
}
