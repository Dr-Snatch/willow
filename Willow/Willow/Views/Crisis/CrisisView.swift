import SwiftUI

struct CrisisView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ZStack {
            Color(red: 0.98, green: 0.96, blue: 0.96).ignoresSafeArea()

            VStack(spacing: 0) {
                RoundedRectangle(cornerRadius: 3)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 36, height: 5)
                    .padding(.top, 12)
                    .padding(.bottom, 20)

                ScrollView {
                    VStack(spacing: 22) {
                        header
                        resources
                        therapistButton
                        controlNote
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color(red: 0.72, green: 0.24, blue: 0.24).opacity(0.12))
                    .frame(width: 72, height: 72)
                Image(systemName: "heart.fill")
                    .font(.system(size: 30))
                    .foregroundColor(Color(red: 0.72, green: 0.24, blue: 0.24))
            }
            Text("You are not alone")
                .willowFont(store, size: 22, weight: .bold)
                .foregroundColor(Color(red: 0.30, green: 0.10, blue: 0.10))
            Text("Real people are available right now. Journaling stays available after this.")
                .willowFont(store, size: 15)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var resources: some View {
        VStack(spacing: 12) {
            CrisisResource(
                icon: "phone.fill",
                color: Color(red: 0.72, green: 0.24, blue: 0.24),
                title: "Samaritans",
                detail: "Call 116 123 - free, 24/7 in the UK and ROI",
                action: { callNumber("116123") }
            )
            CrisisResource(
                icon: "message.fill",
                color: Color(red: 0.20, green: 0.43, blue: 0.72),
                title: "Shout",
                detail: "Text SHOUT to 85258 - UK crisis text support",
                action: { openSMS(number: "85258", body: "SHOUT") }
            )
            CrisisResource(
                icon: "cross.fill",
                color: Color(red: 0.85, green: 0.42, blue: 0.22),
                title: "Emergency services",
                detail: "Call 999 if there is immediate danger",
                action: { callNumber("999") }
            )
        }
    }

    private var therapistButton: some View {
        Button {
            dismiss()
        } label: {
            HStack {
                Image(systemName: "bell.fill")
                Text("Share urgent flag with \(store.therapistName)")
                    .willowFont(store, size: 16, weight: .semibold)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color(red: 0.24, green: 0.55, blue: 0.43))
            .cornerRadius(14)
        }
    }

    private var controlNote: some View {
        Text("You stay in control. Willow does not contact emergency services automatically, and this screen does not block you from writing.")
            .willowFont(store, size: 13)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 12)
    }

    private func callNumber(_ number: String) {
        guard let url = URL(string: "tel://\(number)") else { return }
        UIApplication.shared.open(url)
    }

    private func openSMS(number: String, body: String) {
        guard let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "sms:\(number)&body=\(encodedBody)") else { return }
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
