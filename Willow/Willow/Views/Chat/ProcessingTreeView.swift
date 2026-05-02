import SwiftUI

// Conversation tone detected from last few user messages
enum TreeSentiment { case sunny, rainy }

// MARK: - Full-screen willow animation shown while the insight pipeline runs

struct WillowProcessingView: View {
    @EnvironmentObject private var store: AppStore

    // Sentiment from last few user messages
    private var sentiment: TreeSentiment {
        let text = store.messages.filter { $0.isUser }.suffix(6)
            .map { $0.text.lowercased() }.joined(separator: " ")
        let heavy = ["anxious","anxiety","sad","stress","stressed","overwhelmed",
                     "terrible","scared","worried","panic","tired","lonely",
                     "fear","bad","numb","hopeless","hurt","crying","cry"]
        return heavy.filter { text.contains($0) }.count >= 2 ? .rainy : .sunny
    }

    @State private var trunkProgress: Double = 0   // 0→1 trunk rises
    @State private var frondProgress: Double = 0   // 0→1 fronds extend

    var body: some View {
        GeometryReader { geo in
            TimelineView(.animation) { tl in
                let elapsed = tl.date.timeIntervalSinceReferenceDate
                ZStack {
                    // Sky gradient
                    skyGradient
                        .ignoresSafeArea()

                    // Tree + rain drawn together in one Canvas
                    Canvas { ctx, sz in
                        if sentiment == .rainy {
                            drawRain(&ctx, sz: sz, elapsed: elapsed)
                        }
                        if trunkProgress > 0 {
                            drawWillow(&ctx, sz: sz, elapsed: elapsed)
                        }
                    }
                    .ignoresSafeArea(edges: [.bottom, .horizontal])

                    // Sun (sunny only) — SwiftUI for pulse animation
                    if sentiment == .sunny {
                        FullSunView()
                            .frame(width: 88, height: 88)
                            .position(
                                x: geo.size.width * 0.78,
                                y: geo.safeAreaInsets.top * 0.4 + geo.size.height * 0.14
                            )
                    }

                    // Caption
                    VStack {
                        Spacer()
                        VStack(spacing: 5) {
                            Text("We grow through all of it")
                                .font(.system(size: 16, weight: .medium, design: .rounded))
                                .foregroundColor(.white.opacity(0.88))
                            Text("Finding patterns in your reflection…")
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.52))
                        }
                        .padding(.bottom, geo.safeAreaInsets.bottom + 22)
                    }
                }
            }
        }
        .ignoresSafeArea(edges: [.bottom, .horizontal])
        .onAppear {
            withAnimation(.easeOut(duration: 1.5)) { trunkProgress = 1.0 }
            withAnimation(.easeOut(duration: 2.6).delay(0.9)) { frondProgress = 1.0 }
        }
    }

    // MARK: - Willow tree (Canvas)

    private func drawWillow(_ ctx: inout GraphicsContext, sz: CGSize, elapsed: Double) {
        let cx        = sz.width / 2
        let groundY   = sz.height * 0.76
        let maxTrunkH = min(sz.height * 0.43, 310.0)
        let crownY    = groundY - CGFloat(maxTrunkH * trunkProgress)
        let crown     = CGPoint(x: cx, y: crownY)

        // Fronds hang from crown (drawn behind trunk)
        for spec in willowFronds {
            drawFrond(&ctx, crown: crown, spec: spec, elapsed: elapsed)
        }

        // Trunk — tapered, slightly curved
        var trunk = Path()
        let bw: CGFloat = 16, tw: CGFloat = 7
        trunk.move(to: CGPoint(x: cx - bw/2, y: groundY))
        trunk.addQuadCurve(
            to: CGPoint(x: cx - tw/2, y: crownY),
            control: CGPoint(x: cx - bw/2 + 4, y: (groundY + crownY) * 0.5)
        )
        trunk.addLine(to: CGPoint(x: cx + tw/2, y: crownY))
        trunk.addQuadCurve(
            to: CGPoint(x: cx + bw/2, y: groundY),
            control: CGPoint(x: cx + bw/2 - 4, y: (groundY + crownY) * 0.5)
        )
        trunk.closeSubpath()
        ctx.fill(trunk, with: .color(Color(red: 0.38, green: 0.25, blue: 0.13)))

        // Ground ellipse
        let gr = Path(ellipseIn: CGRect(
            x: cx - sz.width * 0.28, y: groundY - 3,
            width: sz.width * 0.56,  height: 17
        ))
        ctx.fill(gr, with: .color(sentiment == .rainy
            ? Color(red: 0.22, green: 0.44, blue: 0.33)
            : Color(red: 0.29, green: 0.58, blue: 0.34)
        ))
    }

    private func drawFrond(_ ctx: inout GraphicsContext, crown: CGPoint,
                            spec: WillowFrondSpec, elapsed: Double) {
        let len = spec.length * CGFloat(frondProgress)
        guard len > 5 else { return }

        let sx = CGFloat(sin(spec.angle))
        let sy = CGFloat(cos(spec.angle))   // cos(0) = 1 → downward in screen coords ✓

        // Traveling wave: each frond has a phase offset, creating a ripple across the canopy
        let wave = sin(elapsed * 0.68 + spec.swayPhase * .pi * 2.0)
        // Outer fronds (large |sx|) sway more than central fronds
        let swayX = CGFloat(wave) * 17.0 * (0.30 + 0.70 * abs(sx))

        let start = CGPoint(x: crown.x + spec.radius * sx,
                            y: crown.y + spec.radius * sy)

        // Control: keep initial direction but begin to droop under gravity
        let ctrl = CGPoint(
            x: start.x + len * 0.48 * sx * 0.58,
            y: start.y + len * 0.48 * (sy * 0.22 + 0.78)
        )

        // End: tip hangs mostly below start, slight lateral lean + sway
        let end = CGPoint(
            x: start.x + len * sx * 0.11 + swayX,
            y: start.y + len * (sy * 0.05 + 0.95)
        )

        var path = Path()
        path.move(to: start)
        path.addQuadCurve(to: end, control: ctrl)
        ctx.stroke(path, with: .color(spec.color), lineWidth: spec.width)
    }

    // MARK: - Rain (Canvas)

    private func drawRain(_ ctx: inout GraphicsContext, sz: CGSize, elapsed: Double) {
        for drop in rainLayout {
            let rawY = (elapsed * drop.speed + drop.startOffset)
                .truncatingRemainder(dividingBy: Double(sz.height) + 30.0) - 10.0
            let x = drop.xFrac * sz.width
            var p = Path()
            p.move(to: CGPoint(x: x, y: CGFloat(rawY)))
            p.addLine(to: CGPoint(x: x + 1.5, y: CGFloat(rawY) + drop.len))
            ctx.stroke(p, with: .color(
                Color(red: 0.60, green: 0.77, blue: 0.92).opacity(drop.opacity)
            ), lineWidth: 1.3)
        }
    }

    // MARK: - Sky

    private var skyGradient: some View {
        LinearGradient(
            colors: sentiment == .rainy
                ? [Color(red: 0.20, green: 0.27, blue: 0.37), Color(red: 0.42, green: 0.56, blue: 0.54)]
                : [Color(red: 0.96, green: 0.85, blue: 0.54), Color(red: 0.72, green: 0.91, blue: 0.77)],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

// MARK: - Frond data

struct WillowFrondSpec {
    let angle: Double       // from downward vertical: 0=down, -π/2=left, +π/2=right
    let radius: CGFloat     // start offset from crown center
    let length: CGFloat
    let width: CGFloat
    let color: Color
    let swayPhase: Double   // 0..1, left→right, drives traveling wave
}

let willowFronds: [WillowFrondSpec] = {
    // Five greens from the app palette, varying opacity for depth
    let palette: [Color] = [
        Color(red: 0.22, green: 0.54, blue: 0.41).opacity(0.83),
        Color(red: 0.17, green: 0.46, blue: 0.35).opacity(0.76),
        Color(red: 0.27, green: 0.60, blue: 0.46).opacity(0.86),
        Color(red: 0.15, green: 0.42, blue: 0.33).opacity(0.72),
        Color(red: 0.24, green: 0.56, blue: 0.43).opacity(0.80),
    ]
    var specs: [WillowFrondSpec] = []
    for i in 0..<54 {
        let t          = Double(i) / 53.0
        let angle      = -.pi * 0.694 + t * .pi * 1.388
        let nearCenter = 1.0 - abs(angle) / (.pi * 0.694)
        let baseLen    = 80.0 + Double(i % 9) * 9.0
        let length     = CGFloat(baseLen * (1.0 + nearCenter * 0.30))
        let radius     = CGFloat(10 + (i % 7) * 5)
        let width      = CGFloat(0.85) + CGFloat(i % 4) * CGFloat(0.30)
        let spec = WillowFrondSpec(
            angle: angle, radius: radius, length: length,
            width: width, color: palette[i % palette.count], swayPhase: t
        )
        specs.append(spec)
    }
    return specs
}()

// MARK: - Rain data

struct RainDrop {
    let xFrac: CGFloat
    let speed: Double       // screen-heights per second × height
    let startOffset: Double // initial y position spread
    let opacity: Double
    let len: CGFloat
}

let rainLayout: [RainDrop] = {
    var drops: [RainDrop] = []
    for i in 0..<34 {
        let xFrac:  CGFloat = CGFloat(i) / 33.0 * 0.92 + 0.04
        let speed:  Double  = 270.0 + Double(i % 8) * 24.0
        let offset: Double  = Double(i * 53 % 100) / 100.0 * 700.0
        let opac:   Double  = 0.16 + Double(i % 6) * 0.052
        let len:    CGFloat = 12.0 + CGFloat(i % 5) * 3.0
        drops.append(RainDrop(xFrac: xFrac, speed: speed, startOffset: offset, opacity: opac, len: len))
    }
    return drops
}()

// MARK: - Sun view

struct FullSunView: View {
    @State private var scale: CGFloat  = 1.0
    @State private var glow: Double   = 0.10
    @State private var rayOp: Double  = 0.30

    var body: some View {
        ZStack {
            // Outer glow
            Circle()
                .fill(Color(red: 1.0, green: 0.94, blue: 0.58).opacity(glow))
                .frame(width: 88, height: 88)
            // Rays
            ForEach(0..<8) { i in
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color(red: 0.99, green: 0.84, blue: 0.26).opacity(rayOp))
                    .frame(width: 4, height: 17)
                    .offset(y: -36)
                    .rotationEffect(.degrees(Double(i) * 45))
            }
            // Core
            Circle()
                .fill(Color(red: 0.99, green: 0.86, blue: 0.20))
                .frame(width: 36, height: 36)
        }
        .scaleEffect(scale)
        .onAppear {
            withAnimation(.easeInOut(duration: 2.5).repeatForever(autoreverses: true)) {
                scale  = 1.15
                glow   = 0.34
                rayOp  = 0.92
            }
        }
    }
}
