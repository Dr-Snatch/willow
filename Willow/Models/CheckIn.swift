//
//  CheckIn.swift
//  Willow
//
//  Created by Zac on 02/05/2026.
//

import Foundation

struct CheckIn: Codable, Equatable {
    let timestamp: Date
    let mood: Double
    let sleep: Double
}
