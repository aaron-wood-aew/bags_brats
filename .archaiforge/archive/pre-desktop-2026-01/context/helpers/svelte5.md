# Svelte 5 — Archaiforge Quick Reference

## Runes (Reactive Primitives)

```svelte
<script>
  // State
  let count = $state(0);
  let user = $state({ name: 'Alice', age: 30 });
  
  // Derived (computed)
  let doubled = $derived(count * 2);
  let isAdult = $derived(user.age >= 18);
  
  // Effects
  $effect(() => {
    console.log('count changed:', count);
    // cleanup returned function runs on destroy/re-run
    return () => console.log('cleanup');
  });
  
  // Props
  let { title, onClick, children } = $props();
  
  // Bindable props (two-way)
  let { value = $bindable() } = $props();
</script>
```

## Component Patterns

```svelte
<!-- Button.svelte -->
<script>
  let { variant = 'primary', disabled = false, onclick, children } = $props();
</script>

<button class={variant} {disabled} {onclick}>
  {@render children()}
</button>
```

```svelte
<!-- Usage -->
<Button variant="secondary" onclick={() => save()}>
  Save
</Button>
```

## Snippets (Replaces Slots)

```svelte
<script>
  let { header, footer, children } = $props();
</script>

<div class="card">
  {#if header}
    <header>{@render header()}</header>
  {/if}
  
  <main>{@render children()}</main>
  
  {#if footer}
    <footer>{@render footer()}</footer>
  {/if}
</div>
```

```svelte
<!-- Usage -->
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}
  
  <p>Content goes here</p>
  
  {#snippet footer()}
    <Button>Submit</Button>
  {/snippet}
</Card>
```

## Control Flow

```svelte
{#if condition}
  <p>True</p>
{:else if other}
  <p>Other</p>
{:else}
  <p>False</p>
{/if}

{#each items as item, index (item.id)}
  <li>{index}: {item.name}</li>
{:else}
  <p>No items</p>
{/each}

{#await promise}
  <p>Loading...</p>
{:then data}
  <p>{data}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}

{#key value}
  <Component /> <!-- Recreated when value changes -->
{/key}
```

## Event Handling

```svelte
<button onclick={() => count++}>Click</button>
<button onclick={handleClick}>Click</button>

<!-- Event modifiers via wrapper -->
<button onclick={(e) => { e.preventDefault(); handle(e); }}>
  Submit
</button>

<!-- DOM events -->
<input oninput={(e) => name = e.target.value} />
<form onsubmit|preventDefault={handleSubmit}>
```

## Bindings

```svelte
<input bind:value={name} />
<input type="checkbox" bind:checked={accepted} />
<select bind:value={selected}>
  <option value="a">A</option>
</select>
<textarea bind:value={text} />

<!-- Component binding -->
<Input bind:value={email} />

<!-- Element reference -->
<canvas bind:this={canvasEl} />

<!-- Dimensions -->
<div bind:clientWidth={w} bind:clientHeight={h} />
```

## Lifecycle

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    console.log('mounted');
    return () => console.log('cleanup');
  });
  
  // Or use $effect for reactive lifecycle
  $effect(() => {
    const interval = setInterval(() => tick++, 1000);
    return () => clearInterval(interval);
  });
</script>
```

## Stores (External State)

```js
// stores.js
import { writable, readable, derived } from 'svelte/store';

export const count = writable(0);
export const time = readable(new Date(), (set) => {
  const interval = setInterval(() => set(new Date()), 1000);
  return () => clearInterval(interval);
});
export const doubled = derived(count, $c => $c * 2);
```

```svelte
<script>
  import { count } from './stores.js';
  
  // Auto-subscription with $
  $: console.log($count);
</script>

<button onclick={() => $count++}>{$count}</button>
```

## Context

```svelte
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';
  setContext('theme', { color: 'dark' });
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';
  const theme = getContext('theme');
</script>
```

## Transitions

```svelte
<script>
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
</script>

{#if visible}
  <div transition:fade={{ duration: 300 }}>Fades in/out</div>
  <div in:fly={{ y: 200 }} out:fade>Different in/out</div>
{/if}

{#each items as item (item.id)}
  <li animate:flip={{ duration: 300 }}>{item.name}</li>
{/each}
```

## Actions

```svelte
<script>
  function clickOutside(node, callback) {
    const handleClick = (e) => {
      if (!node.contains(e.target)) callback();
    };
    document.addEventListener('click', handleClick);
    return {
      destroy() {
        document.removeEventListener('click', handleClick);
      }
    };
  }
</script>

<div use:clickOutside={() => open = false}>
  Dropdown content
</div>
```

## Class & Style

```svelte
<div class={active ? 'active' : ''}>Static</div>
<div class:active>Shorthand</div>
<div class:active={isActive}>With expression</div>

<div style="color: {color}; font-size: {size}px">Inline</div>
<div style:color style:font-size="{size}px">Shorthand</div>
```

## TypeScript

```svelte
<script lang="ts">
  interface User {
    id: string;
    name: string;
  }
  
  let { user, onSelect }: { 
    user: User; 
    onSelect: (id: string) => void 
  } = $props();
  
  let items = $state<User[]>([]);
</script>
```

## SvelteKit Basics

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

<!-- +page.server.js -->
export async function load({ params, fetch }) {
  const res = await fetch(`/api/items/${params.id}`);
  return { item: await res.json() };
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // handle form
  }
};
```

## Migration from Svelte 4

| Svelte 4 | Svelte 5 |
|----------|----------|
| `let x = 0` (reactive) | `let x = $state(0)` |
| `$: doubled = x * 2` | `let doubled = $derived(x * 2)` |
| `$: { sideEffect() }` | `$effect(() => { sideEffect() })` |
| `export let prop` | `let { prop } = $props()` |
| `<slot />` | `{@render children()}` |
| `<slot name="x" />` | `{@render x?.()}` |
| `on:click={fn}` | `onclick={fn}` |
