import SwiftUI

struct ChatView: View {
    @EnvironmentObject var store: AppStore
    @State private var inputText: String = ""
    @State private var showCrisis = false
    @FocusState private var inputFocused: Bool
    @State private var scrollID: UUID?

    var body: some View {
        ZStack {
            Color.brandBg.ignoresSafeArea()

            VStack(spacing: 0) {
                header
                Divider().opacity(0.4)
                messageList
                inputBar
            }
        }
        .sheet(isPresented: $showCrisis) {
            CrisisView()
        }
    }

    // MARK: - Header
    private var header: some View {
        HStack {
            ZStack {
                Circle().fill(Color.brand.opacity(0.15)).frame(width: 40, height: 40)
                Image(systemName: "leaf.fill")
                    .foregroundColor(.brand)
                    .font(.system(size: 18))
            }
            VStack(alignment: .leading, spacing: 1) {
                Text("Willow")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.brandText)
                Text("AI Companion · Dr. Rivera's practice")
                    .font(.system(size: 12))
                    .foregroundColor(.brandMuted)
            }
            Spacer()
            Button {
                showCrisis = true
            } label: {
                Text("Crisis")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.red.opacity(0.8))
                    .cornerRadius(20)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.brandBg)
    }

    // MARK: - Messages
    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    if store.messages.isEmpty {
                        emptyState
                    }
                    ForEach(store.messages) { msg in
                        MessageBubble(message: msg)
                            .id(msg.id)
                    }
                    if store.isAITyping {
                        TypingIndicator()
                            .id("typing")
                    }
                    Color.clear.frame(height: 8).id("bottom")
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)
            }
            .onChange(of: store.messages.count) { _ in
                withAnimation { proxy.scrollTo("bottom") }
            }
            .onChange(of: store.isAITyping) { _ in
                withAnimation { proxy.scrollTo("bottom") }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Spacer().frame(height: 40)
            Text("Hi, \(store.userName) 👋")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(.brandText)
            Text("I'm here whenever you need to talk — about anything. What's on your mind today?")
                .font(.system(size: 15))
                .foregroundColor(.brandMuted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            VStack(spacing: 8) {
                ForEach(quickStartPrompts, id: \.self) { prompt in
                    Button {
                        store.sendMessage(prompt)
                    } label: {
                        Text(prompt)
                            .font(.system(size: 14))
                            .foregroundColor(.brand)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(Color.brand.opacity(0.1))
                            .cornerRadius(20)
                    }
                }
            }
            .padding(.top, 8)
        }
    }

    private let quickStartPrompts = [
        "I've been feeling really anxious lately",
        "I had a hard day",
        "I'm actually doing okay today",
    ]

    // MARK: - Input bar
    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Message…", text: $inputText, axis: .vertical)
                .font(.system(size: 16))
                .lineLimit(1...4)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color.brandCard)
                .cornerRadius(22)
                .shadow(color: Color.black.opacity(0.06), radius: 4, x: 0, y: 2)
                .focused($inputFocused)

            Button {
                send()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 36))
                    .foregroundColor(inputText.trimmingCharacters(in: .whitespaces).isEmpty ? .gray.opacity(0.3) : .brand)
            }
            .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.brandBg)
    }

    private func send() {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        inputText = ""
        store.sendMessage(text)
    }
}

// MARK: - Message bubble
struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.isUser { Spacer(minLength: 50) }

            if !message.isUser {
                ZStack {
                    Circle().fill(Color.brand.opacity(0.15)).frame(width: 28, height: 28)
                    Image(systemName: "leaf.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.brand)
                }
            }

            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 3) {
                Text(message.text)
                    .font(.system(size: 15))
                    .foregroundColor(message.isUser ? .white : .brandText)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(message.isUser ? Color.brand : Color.brandCard)
                    .cornerRadius(18)
                    .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 1)

                Text(message.timestamp, format: .dateTime.hour().minute())
                    .font(.system(size: 11))
                    .foregroundColor(.brandMuted)
                    .padding(.horizontal, 4)
            }

            if !message.isUser { Spacer(minLength: 50) }
        }
    }
}

// MARK: - Typing indicator
struct TypingIndicator: View {
    @State private var phase = 0

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ZStack {
                Circle().fill(Color.brand.opacity(0.15)).frame(width: 28, height: 28)
                Image(systemName: "leaf.fill").font(.system(size: 12)).foregroundColor(.brand)
            }
            HStack(spacing: 4) {
                ForEach(0..<3) { i in
                    Circle()
                        .fill(Color.brandMuted.opacity(0.6))
                        .frame(width: 7, height: 7)
                        .offset(y: phase == i ? -4 : 0)
                        .animation(.easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.15), value: phase)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color.brandCard)
            .cornerRadius(18)
            .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 1)
            Spacer(minLength: 50)
        }
        .onAppear { phase = 1 }
    }
}

#Preview {
    ChatView().environmentObject(AppStore())
}
