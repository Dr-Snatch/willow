import SwiftUI

struct TherapistLinkView: View {
    @EnvironmentObject private var store: AppStore
    @State private var code = ""

    var body: some View {
        WillowScreen(title: "Therapist link", subtitle: "Use the invite code from your therapist to connect your care plan.") {
            statusCard
            codeCard
            consentCard
        }
        .navigationTitle("Therapist link")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var statusCard: some View {
        WillowCard {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(store.theme.brand.opacity(0.12))
                        .frame(width: 48, height: 48)
                    Image(systemName: store.therapistLinked ? "checkmark.seal.fill" : "person.badge.plus")
                        .foregroundColor(store.theme.brand)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text(store.therapistLinked ? "Connected to \(store.therapistName)" : "No therapist connected")
                        .willowFont(store, size: 16, weight: .semibold)
                        .foregroundColor(store.theme.text)
                    Text(store.therapistLinked ? "Invite code \(store.inviteCode)" : "The app still works privately without a code.")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
            }
        }
    }

    private var codeCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionLabel("Invite code")
                TextField("Enter code", text: $code)
                    .textInputAutocapitalization(.characters)
                    .textFieldStyle(.roundedBorder)
                Button {
                    store.submitInviteCode(code)
                    code = ""
                } label: {
                    Text("Connect therapist")
                        .willowFont(store, size: 16, weight: .semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(store.theme.brand)
                        .cornerRadius(14)
                }
            }
        }
    }

    private var consentCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 10) {
                Text("What linking means")
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(store.theme.text)
                Text("Your therapist can see structured summaries and the data types you consent to share. They do not automatically receive raw journal entries.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
                Text("You can revoke sharing from Settings > Sharing controls.")
                    .willowFont(store, size: 13, weight: .semibold)
                    .foregroundColor(store.theme.brand)
            }
        }
    }
}

struct WindDownView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowScreen(title: "Wind down", subtitle: "A warm, low-stimulation screen for late-night use.") {
            breathingCard
            prepCard
            phoneDownCard
        }
        .navigationTitle("Wind down")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            store.displayMode = .night
        }
    }

    private var breathingCard: some View {
        WillowCard {
            VStack(alignment: .center, spacing: 14) {
                ZStack {
                    Circle()
                        .stroke(store.theme.amber.opacity(0.3), lineWidth: 10)
                        .frame(width: 126, height: 126)
                    VStack(spacing: 4) {
                        Text("4 - 4 - 6")
                            .willowFont(store, size: 24, weight: .bold)
                            .foregroundColor(store.theme.text)
                        Text("breathing")
                            .willowFont(store, size: 13)
                            .foregroundColor(store.theme.muted)
                    }
                }
                Text("Inhale for 4, hold for 4, exhale for 6. Stop if it feels uncomfortable.")
                    .willowFont(store, size: 14)
                    .foregroundColor(store.theme.muted)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var prepCard: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 10) {
                SectionLabel("For your next session")
                Text("This week, lower mood appeared after poor sleep and work stress. This is a candidate observation for you and \(store.therapistName) to review.")
                    .willowFont(store, size: 14)
                    .foregroundColor(store.theme.muted)
            }
        }
    }

    private var phoneDownCard: some View {
        WillowCard {
            HStack(spacing: 12) {
                Image(systemName: "iphone.slash")
                    .font(.system(size: 24))
                    .foregroundColor(store.theme.amber)
                VStack(alignment: .leading, spacing: 3) {
                    Text("Ready to put the phone down?")
                        .willowFont(store, size: 16, weight: .semibold)
                        .foregroundColor(store.theme.text)
                    Text("Willow will keep your place for tomorrow.")
                        .willowFont(store, size: 13)
                        .foregroundColor(store.theme.muted)
                }
            }
        }
    }
}
