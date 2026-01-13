# 🦋 Metamorphosis Stage 2: The Prism Protocol
 
 > **Objective**: Architecture & Blueprinting.
 > **Philosophy**: **Colocation is King.** "Atomic for LLMs is deadly." We do not split libraries simply because we can. We keep context dense and local.
 > **Scope**: Technology Agnostic Analysis.
 
 ## 1. Differential Diagnosis (The Compare)
 **Action**: Differentiate "Truly Global" vs. "Locally Relevant".
 
 *   **Input A**: `[ViewName].html`.
 *   **Input B**: `archai-nexus-base.html`.
 
 **The Golden Rule**:
 *   If it is marked `data-nexus-global="true"` or appears in Foundation: **EXTRACT** (Global Layout).
 *   If it is specific to this View: **KEEP** (Colocated Snippet).
 
 ## 2. The Blueprinting (The Decision)
 Define the structure of the **Single File Organism**.
 
 *   **The Organism**: The Main File (e.g., `TeamView`).
 *   **The Organs (Snippets)**:
     *   Identify every `data-nexus-component` that is NOT global.
     *   Assign it as a `{#snippet name()}` inside the Organism.
 
 ## 3. The Blueprint Artifact
 Generate `breakdown.md`:
 
 ```markdown
 # Component Breakdown: [View Name]
 
 ## Global (External)
 *   `Sidebar`, `Header` -> `src/lib/components/layout/`
 
 ## Organism (One File)
 *   `TeamView.svelte` -> `src/lib/components/[domain]/`
     *   Snippet: `card`
     *   Snippet: `row`
     *   Snippet: `controls`
 
 ## Data Contract (Global)
 *   `types/[domain].ts` (Interfaces only)
 ```
 
 > **Output**: A plan for a dense, context-rich implementation.
