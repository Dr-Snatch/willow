//
//  CheckInView.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import SwiftUI

struct CheckInView: View {
    @ObservedObject var checkInStore: CheckInStore
    
    @State private var mood: Double = 3.0
    @State private var sleep: Double = 5.0

    var body: some View {
        VStack(spacing: 32) {
            
            Text("How are you feeling?")
                .font(.largeTitle)
                .fontWeight(.bold)

            // Mood Slider
            VStack {
                Text("Mood: \(mood, specifier: "%.1f") / 5")
                Slider(value: $mood, in: 1...5, step: 0.5)
            }
            
            // Sleep Slider
            VStack {
                Text("Sleep Quality: \(sleep, specifier: "%.1f") / 10")
                Slider(value: $sleep, in: 1...10, step: 0.5)
            }

            Button(action: {
                checkInStore.completeCheckIn(mood: mood, sleep: sleep)
            }) {
                Text("Continue")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
        }
        .padding(32)
    }
}

#Preview {
    CheckInView(checkInStore: CheckInStore())
}
