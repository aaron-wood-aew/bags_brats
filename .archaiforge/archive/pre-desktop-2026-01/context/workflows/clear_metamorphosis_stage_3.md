# 🦋 Metamorphosis Stage 3: The Atomization Protocol
 
 > **Objective**: Physical Extraction & Logical Hydration.
 > **Philosophy**: **Virtual Decomposition.** We decompose logically (snippets), not physically (files), to preserve Agentic Context.
 > **Scope**: Framework Specific (Svelte 5).
 
 ## 1. Global Isolation (First Pass)
 **Action**: Strip the Shell.
 
 1.  Extract `[GLOBAL]` components (Sidebar, Header) to `src/lib/components/layout/`.
 2.  Assemble them in `src/routes/+layout.svelte`.
 
 ## 2. The Organism Creation (Second Pass)
 **Action**: Create the **Single File Organism** (e.g., `TeamView.svelte`).
 
 1.  **Shell**: Create the main `<div id="view-team">` container.
 2.  **Snippets**: For every Local Component in `breakdown.md`:
     ```svelte
     {#snippet memberCard(member: TeamMember)}
        <!-- HTML from Monolith goes here -->
     {/snippet}
     ```
 3.  **Render**: Replace original HTML blocks with `{@render memberCard(m)}`.
 
 ## 3. The Hydration (Nervous System)
 **Action**: Inject the Logic (Runes).
 
 *   **State**: Use `$state()` at the top level.
 *   **Derived**: Use `$derived()` for filtering logic that spans multiple snippets.
 *   **Actions**: Define `handleAction()` centrally so all snippets trigger the same brain.
 
 ## 4. The Integration (Assembly)
 **Action**: Reassemble the Page.
 
 1.  Open `src/routes/[route]/+page.svelte`.
 2.  Import `TeamView.svelte`.
 3.  **Verify**: Run `npm run dev` in the isolation chamber.
 
 ## 5. The Ledger Lock
 **Action**: Record the birth of new code.
 
 `archaiforge log outcome "Stage 3: Atomized [View] into Single File Organism" --epic "Metamorphosis"`
 
 > **Output**: A powerful, self-contained Svelte 5 view that is easy for Agents and Humans to reason about.
