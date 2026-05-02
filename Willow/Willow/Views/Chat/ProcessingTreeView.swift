import SwiftUI

// MARK: - Sentiment

enum TreeSentiment {
    case sunny  // hopeful / positive tone
    case rainy  // heavy / difficult — rain that still makes things grow
}

// MARK: - Scene

struct ProcessingTreeView: View {
    @EnvironmentObject private var store: AppStore

    private var sentiment: TreeSentiment {
        let text = store.messages.filter { $0.isUser }.suffix(6)
            .map { $0.text.lowercased() }.joined(separator: " ")
        let heavyWords = ["anxious", "anxiety", "sad", "stress", "stressed", "overwhelmed",
                          "terrible", "scared", "worried", "panic", "tired", "lonely",
                          "fear", "bad", "numb", "hopeless", "hurt", "crying", "cry"]
        let hits = heavyWords.filter { text.contains($0) }.count
        return hits >= 2 ? .rainy : .sunny
    }

    var body: some View {
        ZStack {
            skyGradient

            GeometryReader { geo in
                let w = geo.size.width
                let h = geo.size.height
                let groundY = h * 0.73

                ZStack {
                    // Ground ellipse
                    Ellipse()
                        .fill(groundColor)
                        .frame(width: w * 0.52, height: 15)
                        .position(x: w / 2, y: groundY + 5)

                    // Weather
                    if sentiment == .rainy {
                        RainOverlay(width: w, height: h)
                    } else {
                        AnimatedSun()
                            .frame(width: 62, height: 62)
                            .position(x: w * 0.80, y: h * 0.21)
                    }

                    // Trunk
                    RoundedRectangle(cornerRadius: 5)
                        .fill(Color(red: 0.46, green: 0.30, blue: 0.16))
                        .frame(width: 13, height: 56)
                        .position(x: w / 2, y: groundY - 28)

                    // Canopy — grows up from the trunk top
                    AnimatedCanopy()
                        .position(x: w / 2, y: groundY - 80)
                }
            }

            // Caption
            VStack {
                Spacer()
                Text("We grow through all of it")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.82))
                    .padding(.bottom, 10)
            }
        }
        .frame(height: 230)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    private var skyGradient: some View {
        LinearGradient(
            colors: sentiment == .rainy
                ? [Color(red: 0.36, green: 0.43, blue: 0.52), Color(red: 0.60, green: 0.71, blue: 0.69)]
                : [Color(red: 0.97, green: 0.88, blue: 0.60), Color(red: 0.78, green: 0.94, blue: 0.80)],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    private var groundColor: Color {
        sentiment == .rainy
            ? Color(red: 0.24, green: 0.46, blue: 0.34)
            : Color(red: 0.30, green: 0.60, blue: 0.33)
    }
}

// MARK: - Canopy

struct AnimatedCanopy: View {
    @State private var scale: CGFloat = 0.15
    @State private var breathe: CGFloat = 1.0

    var body: some View {
        ZStack {
            // Back-left
            Circle()
                .fill(Color(red: 0.18, green: 0.50, blue: 0.24).opacity(0.88))
                .frame(width: 68, height: 68)
                .offset(x: -23, y: 20)
            // Back-right
            Circle()
                .fill(Color(red: 0.21, green: 0.53, blue: 0.27).opacity(0.88))
                .frame(width: 64, height: 64)
                .offset(x: 23, y: 22)
            // Main top
            Circle()
                .fill(Color(red: 0.25, green: 0.58, blue: 0.31))
                .frame(width: 80, height: 80)
            // Highlight
            Circle()
                .fill(Color(red: 0.34, green: 0.70, blue: 0.39).opacity(0.62))
                .frame(width: 42, height: 42)
                .offset(x: -7, y: 9)
        }
        .scaleEffect(scale * breathe, anchor: .bottom)
        .onAppear {
            withAnimation(.spring(response: 1.5, dampingFraction: 0.62).delay(0.15)) {
                scale = 1.0
            }
            withAnimation(.easeInOut(duration: 3.0).repeatForever(autoreverses: true).delay(1.8)) {
                breathe = 1.07
            }
        }
    }
}

// MARK: - Sun

struct AnimatedSun: View {
    @State private var pulse: CGFloat = 1.0
    @State private var rayOpacity: Double = 0.45

    var body: some View {
        ZStack {
            ForEach(0..<8) { i in
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color(red: 0.99, green: 0.82, blue: 0.26).opacity(rayOpacity))
                    .frame(width: 3.5, height: 13)
                    .offset(y: -29)
                    .rotationEffect(.degrees(Double(i) * 45))
            }
            Circle()
                .fill(Color(red: 1.0, green: 0.92, blue: 0.52).opacity(0.22))
                .frame(width: 46, height: 46)
            Circle()
                .fill(Color(red: 0.99, green: 0.84, blue: 0.20))
                .frame(width: 31, height: 31)
        }
        .scaleEffect(pulse)
        .onAppear {
            withAnimation(.easeInOut(duration: 2.3).repeatForever(autoreverses: true)) {
                pulse = 1.15
                rayOpacity = 1.0
            }
        }
    }
}

// MARK: - Rain

struct DropSpec: Identifiable {
    let id: Int
    let xFrac: CGFloat
    let delay: Double
    let duration: Double
    let opacity: Double
    let dropHeight: CGFloat
}

let rainSpecs: [DropSpec] = (0..<22).map { i in
    // Deterministic pseudo-random values — stable across re-renders
    let slot = CGFloat(i) / 22.0
    let phase = Double(i * 7 % 17)
    return DropSpec(
        id: i,
        xFrac:      slot * 0.94 + 0.03,
        delay:      (phase / 17.0) * 1.8,
        duration:   0.65 + Double(i % 6) * 0.11,
        opacity:    0.28 + Double(i % 5) * 0.07,
        dropHeight: 7 + CGFloat(i % 5) * 1.4
    )
}

struct RainOverlay: View {
    let width: CGFloat
    let height: CGFloat

    var body: some View {
        ZStack {
            ForEach(rainSpecs) { spec in
                FallingDrop(spec: spec, sceneHeight: height)
                    .position(x: spec.xFrac * width, y: 0)
            }
        }
    }
}

struct FallingDrop: View {
    let spec: DropSpec
    let sceneHeight: CGFloat
    @State private var yOff: CGFloat = 0

    var body: some View {
        Capsule()
            .fill(Color(red: 0.58, green: 0.76, blue: 0.93).opacity(spec.opacity))
            .frame(width: 2, height: spec.dropHeight)
            .offset(y: yOff)
            .onAppear {
                withAnimation(
                    .linear(duration: spec.duration)
                    .repeatForever(autoreverses: false)
                    .delay(spec.delay)
                ) {
                    yOff = sceneHeight + 20
                }
            }
    }
}
