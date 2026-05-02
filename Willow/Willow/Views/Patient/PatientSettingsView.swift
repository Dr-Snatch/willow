import SwiftUI

struct PatientSettingsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Settings", subtitle: "Your reminders, appearance, sharing, and account controls.") {
            settingsGroup("Care") {
                NavigationLink {
                    RemindersView()
                } label: {
                    SettingsNavigationRow(icon: "bell.fill", title: "Reminders", subtitle: "Medication, wellness, step goals", tint: store.theme.brand)
                }
                NavigationLink {
                    TherapistLinkView()
                } label: {
                    SettingsNavigationRow(icon: "person.crop.circle.badge.checkmark", title: "Therapist link", subtitle: store.therapistLinked ? "Connected to \(store.therapistName)" : "Enter an invite code", tint: store.theme.brand)
                }
                NavigationLink {
                    CopingStrategiesView()
                } label: {
                    SettingsNavigationRow(icon: "heart.text.square.fill", title: "Toolkit", subtitle: "Therapist-authored plans only", tint: store.theme.brand)
                }
            }

            settingsGroup("Appearance") {
                NavigationLink {
                    DisplayModeView()
                } label: {
                    SettingsNavigationRow(icon: "moon.stars.fill", title: "Display mode", subtitle: store.displayMode.rawValue, tint: store.theme.amber)
                }
                NavigationLink {
                    FontSelectorView()
                } label: {
                    SettingsNavigationRow(icon: "textformat.size", title: "Font", subtitle: store.fontOption.rawValue, tint: store.theme.amber)
                }
                NavigationLink {
                    AccessibilitySettingsView()
                } label: {
                    SettingsNavigationRow(icon: "accessibility", title: "Accessibility", subtitle: "Text size, contrast, motion", tint: store.theme.amber)
                }
            }

            settingsGroup("Data and privacy") {
                NavigationLink {
                    DataPrivacyView()
                } label: {
                    SettingsNavigationRow(icon: "lock.shield.fill", title: "Sharing controls", subtitle: "Choose what \(store.therapistName) can see", tint: store.theme.purple)
                }
                NavigationLink {
                    AccountSettingsView()
                } label: {
                    SettingsNavigationRow(icon: "person.fill", title: "Account", subtitle: "Profile, export, delete account", tint: store.theme.purple)
                }
            }

            NavigationLink {
                WindDownView()
            } label: {
                WillowCard {
                    HStack(spacing: 12) {
                        Image(systemName: "moon.zzz.fill")
                            .font(.system(size: 24))
                            .foregroundColor(store.theme.amber)
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Open wind-down")
                                .willowFont(store, size: 16, weight: .semibold)
                                .foregroundColor(store.theme.text)
                            Text("Sleep mode preview with warmer colours.")
                                .willowFont(store, size: 13)
                                .foregroundColor(store.theme.muted)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(store.theme.muted)
                    }
                }
            }
            .buttonStyle(.plain)
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func settingsGroup<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel(title)
            WillowCard {
                VStack(spacing: 10) {
                    content()
                }
            }
        }
    }
}

struct DisplayModeView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Display mode", subtitle: "Sleep mode uses a warm amber palette for night use.") {
            ForEach(DisplayMode.allCases) { mode in
                Button {
                    store.displayMode = mode
                } label: {
                    WillowCard {
                        HStack(spacing: 12) {
                            Image(systemName: icon(for: mode))
                                .foregroundColor(store.theme.brand)
                                .frame(width: 28)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(mode.rawValue)
                                    .willowFont(store, size: 16, weight: .semibold)
                                    .foregroundColor(store.theme.text)
                                Text(mode.description)
                                    .willowFont(store, size: 13)
                                    .foregroundColor(store.theme.muted)
                            }
                            Spacer()
                            Image(systemName: store.displayMode == mode ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(store.displayMode == mode ? store.theme.brand : store.theme.muted)
                        }
                    }
                }
                .buttonStyle(.plain)
            }

            WillowCard {
                Text("Night mode is designed to be low-glare and lower in blue-heavy colours; users can override it for night-shift work or personal comfort.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
            }
        }
        .navigationTitle("Display")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func icon(for mode: DisplayMode) -> String {
        switch mode {
        case .light: return "sun.max.fill"
        case .dark: return "moon.fill"
        case .night: return "moon.zzz.fill"
        case .automatic: return "wand.and.stars"
        }
    }
}

struct FontSelectorView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Font", subtitle: "System default stays selected unless you choose another option.") {
            ForEach(AppFontOption.allCases) { option in
                Button {
                    store.fontOption = option
                } label: {
                    WillowCard {
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 5) {
                                Text(option.rawValue)
                                    .font(font(for: option, size: 17, weight: .semibold))
                                    .foregroundColor(store.theme.text)
                                Text(option.subtitle)
                                    .willowFont(store, size: 13)
                                    .foregroundColor(store.theme.muted)
                            }
                            Spacer()
                            Image(systemName: store.fontOption == option ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(store.fontOption == option ? store.theme.brand : store.theme.muted)
                        }
                    }
                }
                .buttonStyle(.plain)
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Live preview")
                        .willowFont(store, size: 13, weight: .semibold)
                        .foregroundColor(store.theme.muted)
                    Text("What's on your mind today?")
                        .willowFont(store, size: 18, weight: .semibold)
                        .foregroundColor(store.theme.text)
                    Text("This is how reflective chat text will feel in the selected font.")
                        .willowFont(store, size: 14)
                        .foregroundColor(store.theme.muted)
                }
            }
        }
        .navigationTitle("Font")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func font(for option: AppFontOption, size: CGFloat, weight: Font.Weight) -> Font {
        if let name = option.fontName {
            return .custom(name, size: size).weight(weight)
        }
        return .system(size: size, weight: weight)
    }
}

struct AccessibilitySettingsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Accessibility", subtitle: "Reading comfort can change how usable the app feels.") {
            WillowCard {
                VStack(alignment: .leading, spacing: 16) {
                    SectionLabel("Text size", detail: "\(Int(store.textScale * 100))%")
                    Slider(value: $store.textScale, in: 0.9...1.25, step: 0.05)
                        .tint(store.theme.brand)
                    Text("Preview text should feel readable without crowding the screen.")
                        .willowFont(store, size: 15)
                        .foregroundColor(store.theme.text)
                }
            }

            WillowCard {
                Toggle("High contrast", isOn: $store.highContrast)
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(store.theme.text)
                    .tint(store.theme.brand)
                Toggle("Reduce motion", isOn: $store.reduceMotion)
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(store.theme.text)
                    .tint(store.theme.brand)
            }
        }
        .navigationTitle("Accessibility")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DataPrivacyView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Sharing controls", subtitle: "You control what reaches your therapist.") {
            WillowCard {
                VStack(spacing: 14) {
                    Toggle("Mood check-ins", isOn: $store.moodSharingEnabled)
                        .tint(store.theme.brand)
                    Toggle("AI chat summaries", isOn: $store.chatSharingEnabled)
                        .tint(store.theme.brand)
                    Toggle("Step count", isOn: $store.stepSharingEnabled)
                        .tint(store.theme.brand)
                    Divider().background(store.theme.border)
                    HStack {
                        Text("Medication adherence")
                        Spacer()
                        Image(systemName: "lock.fill")
                            .foregroundColor(store.theme.muted)
                    }
                    .foregroundColor(store.theme.text)
                    .willowFont(store, size: 15, weight: .semibold)
                    Text("Medication adherence is part of the care plan shown to \(store.therapistName). Ask them if this should change.")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
                .willowFont(store, size: 15, weight: .semibold)
                .foregroundColor(store.theme.text)
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 8) {
                    Text("What raw data is shared?")
                        .willowFont(store, size: 16, weight: .semibold)
                        .foregroundColor(store.theme.text)
                    Text("By default, your therapist sees structured summaries and candidate patterns. Raw entries are not shared unless you opt in per entry.")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
            }
        }
        .navigationTitle("Privacy")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AccountSettingsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Account", subtitle: "Profile and data rights.") {
            WillowCard {
                VStack(alignment: .leading, spacing: 14) {
                    MedicationInfoRow(title: "Name", value: store.userName.isEmpty ? "Maya" : store.userName)
                    MedicationInfoRow(title: "Therapist", value: store.therapistLinked ? store.therapistName : "Not connected")
                    MedicationInfoRow(title: "Invite code", value: store.inviteCode)
                }
            }

            WillowCard {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Records")
                        .willowFont(store, size: 16, weight: .semibold)
                        .foregroundColor(store.theme.text)
                    Button("Export my data") {}
                        .foregroundColor(store.theme.brand)
                    Button("Delete account") {}
                        .foregroundColor(store.theme.red)
                }
            }
        }
        .navigationTitle("Account")
        .navigationBarTitleDisplayMode(.inline)
    }
}
