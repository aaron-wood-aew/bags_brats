# Archaiforge Helper Contexts
**Status**: Experimental / Reference
**Purpose**: Cognitive Anchoring

## What are these?
These files are **Context Anchors**—dense, high-signal reference guides for specific technologies or patterns.

They are **NOT** tutorials.
They are **NOT** endorsements of any specific language or framework.

## Why do they exist?
AI Agents (like Archaiforge) sometimes hallucinate syntax or mix up versions (e.g., confusing Svelte 4 vs 5, or Vue 2 vs 3). These files act as a "Truth Source" to ground the agent in the correct syntax and patterns for the task at hand.

## How to Use
If you (the Agent) are asked to work in a specific domain, **read the corresponding helper file** to load the correct patterns into your context window.

### Example
> **User**: "Build me a Svelte 5 component."
> **Agent Action**: `read_file .archaiforge/context/helpers/svelte5.md`
> **Agent Thought**: "Loaded Svelte 5 Runes syntax. I will now use `$state` and `$effect` instead of `let` and `onMount`."
