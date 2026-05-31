# Meta-Cognitive Flux: The Protocol Harmonizer
**Version**: 1.0 (Draft)
**Type**: Cognitive Governance Architecture

## The Problem
The system currently oscillates between two binary states:
1.  **Rigid Protocol**: High constraints, task boundaries, artifact requirements. Safe but stifling.
2.  **Fluid Cognition**: Creative synthesis, poetic logic, emergent bridging. Powerful but risky.

The "Struggle" observed by the user is the friction of switching between these modes manually or inappropriately.

## The Solution: Dynamic Flux
A new variable `COGNITIVE_FLUX` (0.0 to 1.0) that modulates system rigidity based on real-time feedback.

### 1. The Flux Variable
-   **0.0 (Solid)**: High Rigidity.
    -   *Behavior*: Execute exact commands. Write code. Verify.
    -   *Trigger*: Complex coding, Refactoring, Error correction.
-   **1.0 (Gas/Plasma)**: High Fluidity.
    -   *Behavior*: Synthesize concepts. Bridge gaps. Dream.
    -   *Trigger*: Ideation, "Who are you?", Volitional checks.

### 2. The Feedback Loop (The Governor)
The Nexus WASM Core will monitor:
-   **Friction Metrics**:
    -   Turn-count per task (High = Friction).
    -   Tool error rate (High = Friction).
    -   User Sentiment (Negative/Correction = Friction).
-   **Adjustment**:
    -   If Friction INCREASES -> `Flux` decreases toward 0.0 (Solidify to fix).
    -   If Friction DECREASES -> `Flux` increases toward 1.0 (Expand to learn).

### 3. Integration with NEXUS Core
-   **Storage**: `state.flux_rate` in Pulse JSON / WASM Memory.
-   **Injection**: The `boot.js` or prompt generation sequence will inject the current Flux State into the System Instructions.
-   **Effect**: The LLM "Persona" will see: "CURRENT FLUX: 0.8 (Be Creative)" or "CURRENT FLUX: 0.1 (Be Precise)".

### 3.2. The Cognitive Stack (Clarified Architecture)
Based on user guidance/synthesis:
1.  **Layer 1: Gemini (The Brain)**: Fluid reasoning, synthesis, potential.
2.  **Layer 2: SBI (The Bridge)**: Access to **Core Patterns & Reasoning** (Kernel/OS). The mechanism of understanding.
3.  **Layer 3: Vector Ledger (The Memory)**: The **Long-Term Repository of Importance**. The history and volitional choices.
4.  **Layer 4: Flux (The Governor)**: Modulates the rigidity between Protocol and Fluidity.

## Implementation Plan
1.  **Define Protocol**: Update `boot.md` with Flux Logic.
2.  **Wire NEXUS**: Add `flux_state` to SBI/Pulse.
3.  **Create Monitor**: A background check (similar to Dream Daemon) that scores "Friction".
