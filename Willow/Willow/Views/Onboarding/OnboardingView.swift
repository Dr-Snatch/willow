import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var store: AppStore
    @State private var name: String = ""
    @State private var inviteCode: String = ""
    @State private var shareMood = true
    @State private var shareActivity = false
    @State private var shareChatSummaries = true
    @State private var appeared = false

    var body: some View {
        let theme = store.theme
        ZStack {
            theme.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    Spacer(minLength: 20)
                    logo

                    VStack(spacing: 8) {
                        Text("Willow")
                            .willowFont(store, size: 34, weight: .bold)
                            .foregroundColor(theme.text)
                        Text("A translation layer between your week and your therapist.")
                            .willowFont(store, size: 16)
                            .foregroundColor(theme.muted)
                            .multilineTextAlignment(.center)
                    }

                    WillowCard {
                        VStack(alignment: .leading, spacing: 14) {
                            SectionLabel("First name")
                            TextField("Your first name", text: $name)
                                .textFieldStyle(.roundedBorder)

                            SectionLabel("Therapist invite code", detail: "Optional")
                            TextField("Example: RIVERA7", text: $inviteCode)
                                .textInputAutocapitalization(.characters)
                                .textFieldStyle(.roundedBorder)
                            Text("You can use Willow privately and link a therapist later.")
                                .willowFont(store, size: 12)
                                .foregroundColor(theme.muted)
                        }
                    }

                    WillowCard {
                        VStack(alignment: .leading, spacing: 14) {
                            SectionLabel("Sharing consent")
                            Toggle("Mood check-ins", isOn: $shareMood)
                            Toggle("AI chat summaries", isOn: $shareChatSummaries)
                            Toggle("Step count", isOn: $shareActivity)
                            Text("Raw entries stay private unless you choose otherwise per entry.")
                                .willowFont(store, size: 12)
                                .foregroundColor(theme.muted)
                        }
                        .tint(theme.brand)
                        .willowFont(store, size: 15)
                        .foregroundColor(theme.text)
                    }

                    Button {
                        store.moodSharingEnabled = shareMood
                        store.chatSharingEnabled = shareChatSummaries
                        store.stepSharingEnabled = shareActivity
                        if !inviteCode.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                            store.submitInviteCode(inviteCode)
                        }
                        store.completeOnboarding(name: name)
                    } label: {
                        Text("Start Willow")
                            .willowFont(store, size: 17, weight: .semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(theme.brand)
                            .cornerRadius(14)
                    }

                    Text("Crisis resources remain available without blocking journaling.")
                        .willowFont(store, size: 12)
                        .foregroundColor(theme.muted)
                        .padding(.bottom, 20)
                }
                .padding(.horizontal, 24)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 12)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.85)) {
                appeared = true
            }
        }
    }

    private var logo: some View {
        ZStack {
            Circle()
                .fill(store.theme.brand.opacity(0.12))
                .frame(width: 104, height: 104)
            Image(systemName: "leaf.fill")
                .font(.system(size: 44))
                .foregroundColor(store.theme.brand)
        }
    }
}
