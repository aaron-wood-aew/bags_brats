# 🦋 Metamorphosis Stage 1: The Foresight Protocol
 
 > **Objective**: Decouple Monolith to "Smart Static" Artifacts.
 > **Philosophy**: We cannot pack for the journey if we don't know the destination.
 
 ## 1. Target Definition (The Compass)
 Before splitting any files, declare the target architecture:
 *   **Framework**: [e.g., Svelte 5]
 *   **Strategy**: [Maximum Colocation Protocol]
 
 ## 2. Structural Bifurcation (The Prism)
 **Action**: Isolate the Visual Truth.
 1.  **Clone**: `index.html` -> `dashboard.html`.
 2.  **Prune**: Remove all non-dashboard views.
 3.  **Verify**: 0% Pixel Shift against Monolith.
 
 ## 3. The Marker Pass (Architectural Pre-Computation)
 **Action**: Inject "Foresight Markers" (`data-nexus-*`) to guide future assembly.
 
 *   `data-nexus-component="[Name]"`: Marks a reusable block.
 *   `data-nexus-state="[Variable]"`: Marks dynamic text.
 *   `data-nexus-action="[Handler]"`: Marks interaction points.
 *   `data-nexus-global="true"`: **CRITICAL**. Explicitly mark elements (Sidebar, Header) that are TRULY global. This signals to Stage 2 that they must be extracted. All else stays local.
 
 ## 4. Design Token Extraction
 **Action**: Formalize values into Variables.
 1.  **Colors**: `#1e293b` -> `var(--color-surface-900)`.
 2.  **Tokens**: Ensure alignment with `design_system.md`.
 
 ## 5. Artifact Verdict
 **Gate Check**:
 *   [ ] Does `dashboard.html` render perfectly?
 *   [ ] Are Global Elements marked `data-nexus-global="true"`?
 *   [ ] Is the Target Framework defined in the file header?
 
 > **Output**: A "Smart" Decoupled View, ready for the Prism Protocol.
