import Foundation

// MARK: - Internal types

private struct RawInsight: Codable {
    let type: String
    let label: String
    let observation: String
    let confidence: Double
    let evidence: [String]
}

private struct ModelOutput {
    let vendor: String
    let lens: String
    let insights: [RawInsight]
    let round: Int
}

private enum AnalysisLens {
    case emotionalDepth, triggersContext, behaviouralPatterns, longitudinalSignals

    var title: String {
        switch self {
        case .emotionalDepth:       return "emotional depth"
        case .triggersContext:      return "triggers & context"
        case .behaviouralPatterns:  return "behavioural patterns"
        case .longitudinalSignals:  return "longitudinal signals"
        }
    }

    var instructions: String {
        switch self {
        case .emotionalDepth:
            return """
            Your focus is EMOTIONAL DEPTH. Look for:
            — What emotions are present, and how intense are they?
            — What appears underneath the surface emotions — what are the deeper feelings?
            — Where does the emotional tone shift during the conversation, and what precedes those shifts?
            — What emotions seem most difficult for the person to acknowledge or name directly?
            """
        case .triggersContext:
            return """
            Your focus is TRIGGERS AND CONTEXT. Look for:
            — What external situations, people, or environments appear connected to emotional states?
            — What internal states (thoughts, memories) seem to act as triggers?
            — Where does the person describe context that precedes a difficult feeling?
            — What contexts appear protective — what makes things feel more manageable?
            """
        case .behaviouralPatterns:
            return """
            Your focus is BEHAVIOURAL PATTERNS. Look for:
            — What recurring ways of responding appear in what the person describes?
            — Where does the person describe avoidance, withdrawal, or holding back?
            — What behavioural cycles are visible — patterns where one behaviour leads to another?
            — How does the person relate to difficulty — do they approach, avoid, minimise, or name it directly?
            """
        case .longitudinalSignals:
            return """
            Your focus is LONGITUDINAL SIGNALS — patterns likely to persist across time, not just today. Look for:
            — What themes feel established rather than situational?
            — What has the person described as recurring across their life, not just recently?
            — What patterns in this conversation would likely show up again in future sessions?
            — What feels like a deep structure versus a surface reaction to a specific event?
            """
        }
    }
}

enum PipelineError: LocalizedError {
    case insufficientResponses, invalidURL, synthesisFailure

    var errorDescription: String? {
        switch self {
        case .insufficientResponses: return "Not enough model responses to assess consensus."
        case .invalidURL:            return "Invalid API endpoint URL."
        case .synthesisFailure:      return "Synthesis agent failed to produce a result."
        }
    }
}

// MARK: - Service

nonisolated final class InsightPipelineService {
    static let shared = InsightPipelineService()
    private init() {}

    func run(conversation: [ChatMessage], context: PersonalContext? = nil) async -> PipelineResult {
        let round1 = await runRound(conversation: conversation, context: context, round: 1, priorOutputs: nil)

        guard round1.count >= 3 else { return .failed(PipelineError.insufficientResponses) }

        let allOutputs: [ModelOutput]
        if hasBasicConsensus(round1) {
            allOutputs = round1
        } else {
            let round2 = await runRound(conversation: conversation, context: context, round: 2, priorOutputs: round1)
            allOutputs = round1 + round2
        }

        return await synthesize(allOutputs: allOutputs, conversation: conversation)
    }

    // MARK: - Round runner

    private func runRound(
        conversation: [ChatMessage],
        context: PersonalContext?,
        round: Int,
        priorOutputs: [ModelOutput]?
    ) async -> [ModelOutput] {
        await withTaskGroup(of: ModelOutput?.self) { group in
            let geminiPeers  = priorOutputs?.filter { $0.vendor != "gemini" }
            let grokPeers    = priorOutputs?.filter { $0.vendor != "grok" }
            let claudePeers  = priorOutputs?.filter { $0.vendor != "claude" }
            let gptPeers     = priorOutputs?.filter { $0.vendor != "gpt" }

            group.addTask { await self.callGemini(conversation: conversation, context: context, round: round, peers: geminiPeers) }
            group.addTask { await self.callGrok(conversation: conversation, context: context, round: round, peers: grokPeers) }
            group.addTask { await self.callClaude(conversation: conversation, context: context, round: round, peers: claudePeers) }
            group.addTask { await self.callGPT(conversation: conversation, context: context, round: round, peers: gptPeers) }

            var results: [ModelOutput] = []
            for await output in group {
                if let o = output { results.append(o) }
            }
            return results
        }
    }

    // MARK: - Consensus heuristic

    private func hasBasicConsensus(_ outputs: [ModelOutput]) -> Bool {
        let topTypes = outputs.compactMap {
            $0.insights.max(by: { $0.confidence < $1.confidence })?.type
        }
        guard topTypes.count == outputs.count else { return false }
        return Set(topTypes).count == 1
    }

    // MARK: - System prompt builder

    private func buildSystemPrompt(lens: AnalysisLens, round: Int, peers: [ModelOutput]?, context: PersonalContext?) -> String {
        var prompt = """
        You are an insight extraction analyst for Willow, a mental health journaling app used by \
        people in active therapy. You are one of four independent analysts examining the same \
        conversation through different lenses. Your output feeds into a synthesis pipeline — \
        nothing you produce reaches the user directly.

        Hard rules — never break these:
        — Use observational language only. Write "anxiety appears connected to work" not \
        "this person is anxious about work."
        — Never give advice, suggestions, or coping strategies.
        — Never diagnose or apply clinical labels.
        — Only surface what is clearly evidenced in the conversation.
        — If uncertain, lower your confidence score rather than inflating it.

        \(lens.instructions)

        """

        if let ctx = context, !ctx.isEmpty {
            prompt += """

            PERSONAL CONTEXT (from prior confirmed conversations):
            \(ctx.formatted())

            """
        }

        if round == 2, let peers = peers, !peers.isEmpty {
            prompt += "\nPEER REVIEW CONTEXT\n"
            prompt += "The other analysts identified the following in their initial pass. Review your own findings in light of these. Maintain, revise, or add — be honest if a peer found something you missed, or if you believe a peer's finding is unsupported.\n\n"
            for peer in peers {
                let insightText = peer.insights.map { "  - [\($0.type)] \($0.label) (confidence: \($0.confidence)): \($0.observation)" }.joined(separator: "\n")
                prompt += "[\(peer.vendor.uppercased()) — \(peer.lens)]:\n\(insightText)\n\n"
            }
        }

        prompt += """
        Return a JSON object with an "insights" array. Each insight:
        {
          "type": "emotion | trigger | pattern | theme",
          "label": "short descriptive label (max 6 words)",
          "observation": "one sentence in observational language",
          "confidence": 0.0–1.0,
          "evidence": ["direct quote or close paraphrase from the conversation"]
        }
        Return only the JSON object. No preamble.
        """

        return prompt
    }

    private func buildUserContent(conversation: [ChatMessage]) -> String {
        let transcript = conversation
            .map { "\($0.isUser ? "Person" : "Companion"): \($0.text)" }
            .joined(separator: "\n")
        return "Analyse this journaling conversation:\n\n\(transcript)"
    }

    // MARK: - Vendor: Gemini

    private func callGemini(conversation: [ChatMessage], context: PersonalContext?, round: Int, peers: [ModelOutput]?) async -> ModelOutput? {
        let system  = buildSystemPrompt(lens: .emotionalDepth, round: round, peers: peers, context: context)
        let user    = buildUserContent(conversation: conversation)
        guard let url = URL(string: "https://generativelanguage.googleapis.com/v1beta/models/\(APIConfig.geminiModel):generateContent?key=\(APIConfig.geminiAPIKey)") else { return nil }

        let body: [String: Any] = [
            "systemInstruction": ["parts": [["text": system]]],
            "contents": [["role": "user", "parts": [["text": user]]]],
            "generationConfig": ["responseMimeType": "application/json"]
        ]

        guard let response = await post(url: url, body: body, headers: ["Content-Type": "application/json"]),
              let candidates = response["candidates"] as? [[String: Any]],
              let content = candidates.first?["content"] as? [String: Any],
              let parts = content["parts"] as? [[String: Any]],
              let text = parts.first?["text"] as? String
        else { return nil }

        return ModelOutput(vendor: "gemini", lens: AnalysisLens.emotionalDepth.title, insights: parse(text), round: round)
    }

    // MARK: - Vendor: Grok

    private func callGrok(conversation: [ChatMessage], context: PersonalContext?, round: Int, peers: [ModelOutput]?) async -> ModelOutput? {
        let system = buildSystemPrompt(lens: .triggersContext, round: round, peers: peers, context: context)
        let user   = buildUserContent(conversation: conversation)
        guard let url = URL(string: "https://api.x.ai/v1/chat/completions") else { return nil }

        let body: [String: Any] = [
            "model": APIConfig.grokModel,
            "response_format": ["type": "json_object"],
            "messages": [["role": "system", "content": system], ["role": "user", "content": user]]
        ]
        let headers = ["Authorization": "Bearer \(APIConfig.grokAPIKey)", "Content-Type": "application/json"]

        guard let text = extractOpenAIContent(await post(url: url, body: body, headers: headers)) else { return nil }
        return ModelOutput(vendor: "grok", lens: AnalysisLens.triggersContext.title, insights: parse(text), round: round)
    }

    // MARK: - Vendor: Claude (Sonnet — behavioural patterns lens)

    private func callClaude(conversation: [ChatMessage], context: PersonalContext?, round: Int, peers: [ModelOutput]?) async -> ModelOutput? {
        let system = buildSystemPrompt(lens: .behaviouralPatterns, round: round, peers: peers, context: context)
        let user   = buildUserContent(conversation: conversation)
        guard let url = URL(string: "https://api.anthropic.com/v1/messages") else { return nil }

        let body: [String: Any] = [
            "model": APIConfig.claudePipelineModel,
            "max_tokens": 1024,
            "system": system,
            "messages": [["role": "user", "content": user]]
        ]
        let headers = ["x-api-key": APIConfig.anthropicAPIKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json"]

        guard let text = extractAnthropicContent(await post(url: url, body: body, headers: headers)) else { return nil }
        return ModelOutput(vendor: "claude", lens: AnalysisLens.behaviouralPatterns.title, insights: parse(text), round: round)
    }

    // MARK: - Vendor: GPT

    private func callGPT(conversation: [ChatMessage], context: PersonalContext?, round: Int, peers: [ModelOutput]?) async -> ModelOutput? {
        let system = buildSystemPrompt(lens: .longitudinalSignals, round: round, peers: peers, context: context)
        let user   = buildUserContent(conversation: conversation)
        guard let url = URL(string: "https://api.openai.com/v1/chat/completions") else { return nil }

        let body: [String: Any] = [
            "model": APIConfig.gptModel,
            "response_format": ["type": "json_object"],
            "messages": [["role": "system", "content": system], ["role": "user", "content": user]]
        ]
        let headers = ["Authorization": "Bearer \(APIConfig.openAIAPIKey)", "Content-Type": "application/json"]

        guard let text = extractOpenAIContent(await post(url: url, body: body, headers: headers)) else { return nil }
        return ModelOutput(vendor: "gpt", lens: AnalysisLens.longitudinalSignals.title, insights: parse(text), round: round)
    }

    // MARK: - Synthesis (Opus 4.7, extended thinking)

    private func synthesize(allOutputs: [ModelOutput], conversation: [ChatMessage]) async -> PipelineResult {
        guard let url = URL(string: "https://api.anthropic.com/v1/messages") else {
            return .failed(PipelineError.invalidURL)
        }

        let roundsRun = Set(allOutputs.map { $0.round }).count
        var systemPrompt = """
        You are the synthesis agent for Willow's insight pipeline. You have received \
        \(allOutputs.count) analyses from four independent analysts across \(roundsRun) round(s). \
        Each analyst examined the same conversation through a different lens.

        Your task:
        1. Identify where the analysts converge — what do they collectively see?
        2. Identify where they diverge — what do only some of them see?
        3. Make a final weighted determination: which insights are genuinely supported across \
        the full body of evidence?

        Hard rules:
        — Observational language only. Never advice, never diagnosis, never clinical labels.
        — Only surface insights that have meaningful cross-analyst support.
        — A lower confidence score is always better than false precision.
        — If the analysts cannot reach meaningful convergence on any insight, say so clearly.

        Analyst outputs:\n\n
        """

        for output in allOutputs {
            let insightText = output.insights.map {
                "  [\($0.type.uppercased())] \($0.label) (confidence: \(String(format: "%.2f", $0.confidence)))\n  \($0.observation)\n  Evidence: \($0.evidence.joined(separator: "; "))"
            }.joined(separator: "\n\n")
            systemPrompt += "[\(output.vendor.uppercased()) — \(output.lens) — Round \(output.round)]\n\(insightText)\n\n"
        }

        systemPrompt += """
        Return a JSON object:
        {
          "consensus_reached": true | false,
          "insights": [
            {
              "type": "emotion | trigger | pattern | theme",
              "label": "short label",
              "observation": "one observational sentence",
              "confidence": 0.0–1.0,
              "evidence": ["quote or paraphrase"],
              "supporting_models": ["gemini", "grok", "claude", "gpt"]
            }
          ],
          "divergence_note": "brief explanation if consensus was not reached or was partial"
        }
        Return only JSON. No preamble.
        """

        let body: [String: Any] = [
            "model": APIConfig.synthesisModel,
            "max_tokens": 12000,
            "thinking": ["type": "enabled", "budget_tokens": APIConfig.synthesisThinkingBudget],
            "system": systemPrompt,
            "messages": [["role": "user", "content": buildUserContent(conversation: conversation)]]
        ]
        let headers = ["x-api-key": APIConfig.anthropicAPIKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json"]

        guard let response = await post(url: url, body: body, headers: headers),
              let content = response["content"] as? [[String: Any]],
              let textBlock = content.first(where: { $0["type"] as? String == "text" }),
              let text = textBlock["text"] as? String
        else { return .failed(PipelineError.synthesisFailure) }

        return parseSynthesis(text, roundsRun: roundsRun)
    }

    // MARK: - Parsing helpers

    private func parse(_ text: String) -> [RawInsight] {
        let cleaned = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let data = cleaned.data(using: .utf8) else { return [] }

        // Accept both {"insights": [...]} and [...]
        if let obj = try? JSONDecoder().decode([String: [RawInsight]].self, from: data),
           let insights = obj["insights"] { return insights }
        if let arr = try? JSONDecoder().decode([RawInsight].self, from: data) { return arr }
        return []
    }

    private func parseSynthesis(_ text: String, roundsRun: Int) -> PipelineResult {
        guard let data = text.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return .failed(PipelineError.synthesisFailure) }

        let consensusReached = obj["consensus_reached"] as? Bool ?? false
        guard consensusReached,
              let rawInsights = obj["insights"] as? [[String: Any]]
        else { return .noConsensus }

        let insights: [Insight] = rawInsights.compactMap { raw in
            guard let typeStr     = raw["type"] as? String,
                  let insightType = InsightType(rawValue: typeStr),
                  let label       = raw["label"] as? String,
                  let observation = raw["observation"] as? String,
                  let confidence  = raw["confidence"] as? Double
            else { return nil }

            let evidence  = raw["evidence"] as? [String] ?? []
            let models    = raw["supporting_models"] as? [String] ?? []
            let provenance = InsightProvenance(models: models, roundsNeeded: roundsRun, synthesisUsed: true)
            return Insight(type: insightType, label: label, observation: observation,
                           confidence: confidence, evidence: evidence, provenance: provenance)
        }

        return insights.isEmpty ? .noConsensus : .consensus(insights)
    }

    private func extractOpenAIContent(_ response: [String: Any]?) -> String? {
        guard let choices = response?["choices"] as? [[String: Any]],
              let message = choices.first?["message"] as? [String: Any],
              let content = message["content"] as? String else { return nil }
        return content
    }

    private func extractAnthropicContent(_ response: [String: Any]?) -> String? {
        guard let content = response?["content"] as? [[String: Any]],
              let textBlock = content.first(where: { $0["type"] as? String == "text" }),
              let text = textBlock["text"] as? String else { return nil }
        return text
    }

    // MARK: - Network

    private func post(url: URL, body: [String: Any], headers: [String: String]) async -> [String: Any]? {
        guard let httpBody = try? JSONSerialization.data(withJSONObject: body) else { return nil }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = httpBody
        for (k, v) in headers { request.setValue(v, forHTTPHeaderField: k) }
        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }
        return json
    }
}
