//
//  ContentView.swift
//  Willow
//
//  Created by Arthur  on 02/05/2026.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var store = AppStore()

    var body: some View {
        Group {
            if store.hasOnboarded {
                HomeView()
            } else {
                OnboardingView()
            }
        }
        .environmentObject(store)
    }
}
