import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var store: AppStore
    @State private var name: String = ""
    @State private var appeared = false

    var body: some View {
        ZStack {
            Color.brandBg.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo
                ZStack {
                    Circle()
                        .fill(Color.brand.opacity(0.12))
                        .frame(width: 100, height: 100)
                    Image(systemName: "leaf.fill")
                        .font(.system(size: 44))
                        .foregroundColor(.brand)
                }
                .scaleEffect(appeared ? 1 : 0.6)
                .opacity(appeared ? 1 : 0)
                .padding(.bottom, 28)

                Text("Willow")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.brandText)
                    .opacity(appeared ? 1 : 0)

                Text("Your companion between sessions.")
                    .font(.system(size: 17, weight: .regular))
                    .foregroundColor(.brandMuted)
                    .padding(.top, 6)
                    .opacity(appeared ? 1 : 0)

                Spacer().frame(height: 52)

                // Name field
                VStack(alignment: .leading, spacing: 8) {
                    Text("What should I call you?")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.brandMuted)

                    TextField("Your first name", text: $name)
                        .font(.system(size: 17))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(Color.brandCard)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
                }
                .padding(.horizontal, 32)
                .opacity(appeared ? 1 : 0)

                Spacer().frame(height: 24)

                Button {
                    store.completeOnboarding(name: name)
                } label: {
                    Text("Get Started")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.brand)
                        .cornerRadius(14)
                }
                .padding(.horizontal, 32)
                .opacity(appeared ? 1 : 0)

                Spacer()

                Text("Connected to Dr. Rivera's practice")
                    .font(.system(size: 13))
                    .foregroundColor(.brandMuted)
                    .padding(.bottom, 32)
                    .opacity(appeared ? 1 : 0)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }
}

#Preview {
    OnboardingView().environmentObject(AppStore())
}
