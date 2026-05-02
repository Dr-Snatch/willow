import SwiftUI

struct ChatView: View {
    @EnvironmentObject var store: AppStore
    @State private var inputText: String = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        ZStack {
            store.theme.background.ignoresSafeArea()
            VStack(spacing: 0) {
                header
                Divider().background(store.theme.border)
                messageList
                bottomBar
            }

            // Full-screen willow animation during pipeline processing
            if store.conversationPhase == .processing {
                WillowProcessingView()
                    .transition(.opacity.animation(.easeInOut(duration: 0.5)))
                    .zIndex(1)
            }
        }
        .navigationTitle("Reflect")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $store.showCrisisSheet) {
            CrisisView()
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(store.theme.brand.opacity(0.15))
                    .frame(width: 42, height: 42)
                Image(systemName: "leaf.fill")
                    .foregroundColor(store.theme.brand)
                    .font(.system(size: 18))
            }
            VStack(alignment: .leading, spacing: 2) {
                Text("Willow")
                    .willowFont(store, size: 16, weight: .semibold)
                    .foregroundColor(store.theme.text)
                Text("Reflective journaling companion")
                    .willowFont(store, size: 12)
                    .foregroundColor(store.theme.muted)
            }
            Spacer()
            #if DEBUG
            Menu {
                Button("Clear-cut test") { Task { await store.runPipelineClearCut() } }
                Button("Subtle traits test") { Task { await store.runPipelineWithMockData() } }
            } label: {
                Text("Test")
                    .willowFont(store, size: 12, weight: .semibold)
                    .foregroundColor(store.theme.brand)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(store.theme.brand.opacity(0.12))
                    .cornerRadius(12)
            }
            .disabled(store.conversationPhase != .active)
            #endif

            Button {
                store.showCrisisSheet = true
            } label: {
                Image(systemName: "heart.fill")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 36, height: 36)
                    .background(store.theme.red.opacity(0.85))
                    .clipShape(Circle())
            }
            .accessibilityLabel("Open crisis resources")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(store.theme.background)
    }

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
                    if !store.messages.isEmpty {
                        TherapistPlanPreview()
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
            .onChange(of: store.messages.count) { _, _ in
                withAnimation { proxy.scrollTo("bottom") }
            }
            .onChange(of: store.messages.last?.text) { _, _ in
                proxy.scrollTo("bottom")
            }
            .onChange(of: store.isAITyping) { _, _ in
                withAnimation { proxy.scrollTo("bottom") }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            Spacer().frame(height: 28)
            Text("Hi, \(store.userName.isEmpty ? "Maya" : store.userName)")
                .willowFont(store, size: 21, weight: .bold)
                .foregroundColor(store.theme.text)
            Text("Write what is here. Willow listens, asks open questions, and saves the pattern work for later review.")
                .willowFont(store, size: 15)
                .foregroundColor(store.theme.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)

            VStack(spacing: 8) {
                ForEach(quickStartPrompts, id: \.self) { prompt in
                    Button {
                        Task { await store.sendMessage(prompt) }
                    } label: {
                        Text(prompt)
                            .willowFont(store, size: 14, weight: .medium)
                            .foregroundColor(store.theme.brand)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 9)
                            .background(store.theme.brand.opacity(0.1))
                            .cornerRadius(20)
                    }
                }
            }
            .padding(.top, 4)
        }
    }

    private let quickStartPrompts = [
        "I've been feeling anxious lately",
        "I had a hard day",
        "I want to understand a thought loop"
    ]

    @ViewBuilder
    private var bottomBar: some View {
        switch store.conversationPhase {
        case .active:
            inputBar
        case .processing:
            EmptyView()
        case .ended(let insights):
            conversationEndCard(insights)
        case .noConsensus:
            noConsensusCard
        }
    }

    @ViewBuilder
    private func conversationEndCard(_ insights: [Insight]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(store.theme.brand)
                Text("Pattern candidates found")
                    .willowFont(store, size: 15, weight: .semibold)
                    .foregroundColor(store.theme.text)
                Spacer()
                Text("\(insights.count)")
                    .willowFont(store, size: 15, weight: .bold)
                    .foregroundColor(store.theme.brand)
            }

            ForEach(insights.prefix(3)) { insight in
                InsightRow(insight: insight)
            }
            if insights.count > 3 {
                Text("+\(insights.count - 3) more")
                    .willowFont(store, size: 12)
                    .foregroundColor(store.theme.muted)
                    .padding(.leading, 16)
            }

            Divider().background(store.theme.border)

            HStack {
                Button("New reflection") {
                    store.startNewConversation()
                }
                .willowFont(store, size: 14)
                .foregroundColor(store.theme.muted)
                Spacer()
                Button("Review & share") { }
                    .willowFont(store, size: 14, weight: .semibold)
                    .foregroundColor(store.theme.brand)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity)
        .background(store.theme.background)
    }

    private var noConsensusCard: some View {
        VStack(spacing: 10) {
            Image(systemName: "person.2.fill")
                .font(.system(size: 22))
                .foregroundColor(store.theme.brand)
            Text("Bring this to your session")
                .willowFont(store, size: 15, weight: .semibold)
                .foregroundColor(store.theme.text)
            Text("Willow's analysis didn't reach a confident pattern this time. The best next step is to explore this with \(store.therapistName).")
                .willowFont(store, size: 13)
                .foregroundColor(store.theme.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)
            Button("Start a new reflection") {
                store.startNewConversation()
            }
            .willowFont(store, size: 14, weight: .medium)
            .foregroundColor(store.theme.brand)
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(store.theme.background)
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Message...", text: $inputText, axis: .vertical)
                .willowFont(store, size: 16)
                .lineLimit(1...4)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(store.theme.card)
                .foregroundColor(store.theme.text)
                .cornerRadius(22)
                .overlay(
                    RoundedRectangle(cornerRadius: 22)
                        .stroke(store.theme.border, lineWidth: 1)
                )
                .focused($inputFocused)

            Button {
                send()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 36))
                    .foregroundColor(canSend ? store.theme.brand : store.theme.muted.opacity(0.35))
            }
            .disabled(!canSend)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(store.theme.background)
    }

    private var canSend: Bool {
        !inputText.trimmingCharacters(in: .whitespaces).isEmpty && !store.isAITyping
    }

    private func send() {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        inputText = ""
        Task { await store.sendMessage(text) }
    }
}

struct MessageBubble: View {
    @EnvironmentObject private var store: AppStore
    let message: ChatMessage

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.isUser { Spacer(minLength: 50) }

            if !message.isUser {
                ZStack {
                    Circle()
                        .fill(store.theme.brand.opacity(0.15))
                        .frame(width: 28, height: 28)
                    Image(systemName: "leaf.fill")
                        .font(.system(size: 12))
                        .foregroundColor(store.theme.brand)
                }
            }

            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 3) {
                Text(message.text.isEmpty ? " " : message.text)
                    .willowFont(store, size: 15)
                    .foregroundColor(message.isUser ? .white : store.theme.text)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(message.isUser ? store.theme.brand : store.theme.card)
                    .cornerRadius(18)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18)
                            .stroke(message.isUser ? Color.clear : store.theme.border, lineWidth: 1)
                    )

                Text(message.timestamp, format: .dateTime.hour().minute())
                    .willowFont(store, size: 11)
                    .foregroundColor(store.theme.muted)
                    .padding(.horizontal, 4)
            }

            if !message.isUser { Spacer(minLength: 50) }
        }
    }
}

struct TherapistPlanPreview: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        WillowCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "person.text.rectangle.fill")
                        .foregroundColor(store.theme.brand)
                    Text("Plan available from \(store.therapistName)")
                        .willowFont(store, size: 14, weight: .semibold)
                        .foregroundColor(store.theme.text)
                }
                Text("If a trigger matches a plan your therapist wrote for you, Willow can show that plan here. Willow does not invent coping advice.")
                    .willowFont(store, size: 13)
                    .foregroundColor(store.theme.muted)
            }
        }
        .padding(.top, 4)
    }
}

struct InsightRow: View {
    @EnvironmentObject private var store: AppStore
    let insight: Insight

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Circle()
                .fill(typeColor)
                .frame(width: 7, height: 7)
                .padding(.top, 5)
            VStack(alignment: .leading, spacing: 2) {
                Text(insight.label)
                    .willowFont(store, size: 13, weight: .medium)
                    .foregroundColor(store.theme.text)
                Text(insight.observation)
                    .willowFont(store, size: 12)
                    .foregroundColor(store.theme.muted)
                    .lineLimit(2)
            }
            Spacer()
            Text("\(Int(insight.confidence * 100))%")
                .willowFont(store, size: 11)
                .foregroundColor(store.theme.muted)
                .padding(.top, 1)
        }
    }

    private var typeColor: Color {
        switch insight.type {
        case .emotion:  return store.theme.red.opacity(0.85)
        case .trigger:  return store.theme.amber.opacity(0.85)
        case .pattern:  return store.theme.brand
        case .theme:    return store.theme.purple
        }
    }
}

struct TypingIndicator: View {
    @EnvironmentObject private var store: AppStore
    @State private var phase = 0

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ZStack {
                Circle()
                    .fill(store.theme.brand.opacity(0.15))
                    .frame(width: 28, height: 28)
                Image(systemName: "leaf.fill")
                    .font(.system(size: 12))
                    .foregroundColor(store.theme.brand)
            }
            HStack(spacing: 4) {
                ForEach(0..<3) { i in
                    Circle()
                        .fill(store.theme.muted.opacity(0.6))
                        .frame(width: 7, height: 7)
                        .offset(y: phase == i ? -4 : 0)
                        .animation(.easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.15), value: phase)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(store.theme.card)
            .cornerRadius(18)
            Spacer(minLength: 50)
        }
        .onAppear { phase = 1 }
    }
}
