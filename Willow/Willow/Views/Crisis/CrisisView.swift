import SwiftUI

struct CrisisView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            Color(red: 0.98, green: 0.96, blue: 0.96).ignoresSafeArea()

            VStack(spacing: 0) {
                // Handle
                RoundedRectangle(cornerRadius: 3)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 36, height: 5)
                    .padding(.top, 12)
                    .padding(.bottom, 20)

                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(Color.red.opacity(0.12))
                                    .frame(width: 72, height: 72)
                                Image(systemName: "heart.fill")
                                    .font(.system(size: 30))
                                    .foregroundColor(.red.opacity(0.8))
                            }
                            Text("You're not alone")
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundColor(Color(red: 0.3, green: 0.1, blue: 0.1))
                            Text("Real people are available right now.")
                                .font(.system(size: 15))
                                .foregroundColor(.secondary)
                        }

                        // Crisis lines
                        VStack(spacing: 12) {
                            CrisisResource(
                                icon: "phone.fill",
                                color: .red,
                                title: "988 Suicide & Crisis Lifeline",
                                detail: "Call or text 988 · Available 24/7",
                                action: { callNumber("988") }
                            )
                            CrisisResource(
                                icon: "message.fill",
                                color: Color(red: 0.2, green: 0.5, blue: 0.9),
                                title: "Crisis Text Line",
                                detail: "Text HOME to 741741",
                                action: { openTextLine() }
                            )
                            CrisisResource(
                                icon: "cross.fill",
                                color: Color(red: 0.9, green: 0.4, blue: 0.2),
                                title: "Emergency Services",
                                detail: "Call 911 for immediate danger",
                                action: { callNumber("911") }
                            )
                        }

                        // Notify therapist
                        Button {
                            dismiss()
                        } label: {
                            HStack {
                                Image(systemName: "bell.fill")
                                Text("Notify Dr. Rivera")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color(red: 0.24, green: 0.55, blue: 0.43))
                            .cornerRadius(14)
                        }

                        Text("Your therapist will be alerted and will follow up with you.")
                            .font(.system(size: 13))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                            .padding(.bottom, 32)
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }

    private func callNumber(_ number: String) {
        guard let url = URL(string: "tel://\(number)") else { return }
        UIApplication.shared.open(url)
    }

    private func openTextLine() {
        guard let url = URL(string: "sms:741741&body=HOME") else { return }
        UIApplication.shared.open(url)
    }
}

struct CrisisResource: View {
    let icon: String
    let color: Color
    let title: String
    let detail: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(color.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .foregroundColor(color)
                        .font(.system(size: 18))
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(Color(red: 0.11, green: 0.17, blue: 0.15))
                    Text(detail)
                        .font(.system(size: 13))
                        .foregroundColor(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            .padding(14)
            .background(Color.white)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    CrisisView()
}
