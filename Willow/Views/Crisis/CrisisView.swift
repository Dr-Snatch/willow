//
//  CrisisView.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import SwiftUI

struct CrisisResource: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let url: String
}

struct CrisisView: View {
    
    // This list would ideally be loaded from a versioned JSON file
    private let crisisResources: [CrisisResource] = [
        .init(name: "SHOUT Text Line", description: "Text SHOUT to 85258 for free, 24/7 confidential support.", url: "sms:85258"),
        .init(name: "Samaritans", description: "Call 116 123 to talk to someone at any time, day or night.", url: "tel:116123"),
        .init(name: "NHS 111", description: "Call 111 for urgent medical advice if you are in the UK.", url: "tel:111")
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text("Immediate Support")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.horizontal)

            Text("If you are in crisis or need immediate help, please reach out to one of the services below.")
                .padding(.horizontal)

            List(crisisResources) { resource in
                VStack(alignment: .leading, spacing: 8) {
                    Text(resource.name)
                        .font(.headline)
                    Text(resource.description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Link("Open \(resource.name)", destination: URL(string: resource.url)!)
                        .buttonStyle(.bordered)
                        .tint(.orange)
                        .padding(.top, 4)
                }
                .padding(.vertical)
            }
            .listStyle(.plain)
            
            Spacer()
        }
        .padding(.top)
    }
}

#Preview {
    CrisisView()
}
