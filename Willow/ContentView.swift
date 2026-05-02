//
//  ContentView.swift
//  Willow
//
//  Created by Arthur  on 02/05/2026.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var conversation = Conversation()

    var body: some View {
        NavigationView {
            if conversation.isCrisis {
                CrisisView()
            } else {
                ChatView(conversation: conversation)
            }
        }
    }
}
#Preview {
    ContentView()
}
