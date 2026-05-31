# Vue 3 — Archaiforge Quick Reference

## Composition API

### Reactivity

```vue
<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue'

// Primitive reactivity
const count = ref(0)
count.value++ // Access with .value in script

// Object reactivity (no .value needed for properties)
const user = reactive({ name: 'Alice', age: 30 })
user.name = 'Bob'

// Computed (cached, derived state)
const doubled = computed(() => count.value * 2)

// Writable computed
const fullName = computed({
  get: () => `${first.value} ${last.value}`,
  set: (val) => {
    const [f, l] = val.split(' ')
    first.value = f
    last.value = l
  }
})

// Watch specific source
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// Watch multiple
watch([count, user], ([newCount, newUser]) => {
  console.log(newCount, newUser)
})

// Deep watch
watch(user, (newUser) => {
  console.log('user changed', newUser)
}, { deep: true })

// Immediate execution
watch(id, fetchData, { immediate: true })

// Auto-tracking dependencies
watchEffect(() => {
  console.log('count is', count.value)
})
</script>

<template>
  <!-- No .value in template -->
  <p>{{ count }}</p>
  <p>{{ user.name }}</p>
</template>
```

### Lifecycle

```vue
<script setup>
import { 
  onMounted, 
  onUnmounted, 
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
  onBeforeUpdate
} from 'vue'

onMounted(() => {
  console.log('component mounted')
  fetchData()
})

onUnmounted(() => {
  cleanup()
})
</script>
```

### Template Refs

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputEl = ref(null)

onMounted(() => {
  inputEl.value.focus()
})
</script>

<template>
  <input ref="inputEl" />
</template>
```

## Props & Emits

```vue
<script setup>
// Props
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0,
    required: false,
    validator: (v) => v >= 0
  }
})

// TypeScript
const props = defineProps<{
  title: string
  count?: number
}>()

// With defaults (TS)
const props = withDefaults(defineProps<{
  title: string
  count?: number
}>(), {
  count: 0
})

// Emits
const emit = defineEmits(['update', 'delete'])
emit('update', newValue)

// TypeScript emits
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()

// v-model support
const model = defineModel()
// Usage: <Child v-model="value" />
</script>
```

## Slots

```vue
<!-- Parent.vue -->
<template>
  <Card>
    <!-- Default slot -->
    <p>Main content</p>
    
    <!-- Named slot -->
    <template #header>
      <h1>Title</h1>
    </template>
    
    <!-- Scoped slot -->
    <template #item="{ item, index }">
      <li>{{ index }}: {{ item.name }}</li>
    </template>
  </Card>
</template>

<!-- Card.vue -->
<template>
  <div class="card">
    <header>
      <slot name="header">Default Header</slot>
    </header>
    
    <main>
      <slot>Default content</slot>
    </main>
    
    <ul>
      <slot name="item" v-for="(item, index) in items" 
        :item="item" :index="index" />
    </ul>
  </div>
</template>
```

## Directives

```vue
<template>
  <!-- Conditionals -->
  <div v-if="show">Visible</div>
  <div v-else-if="other">Other</div>
  <div v-else>Hidden</div>
  
  <div v-show="show">CSS toggle (stays in DOM)</div>
  
  <!-- Lists -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
  
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }}: {{ item.name }}
  </li>
  
  <li v-for="(value, key) in object" :key="key">
    {{ key }}: {{ value }}
  </li>
  
  <!-- Binding -->
  <img :src="url" />
  <div :class="{ active: isActive }" />
  <div :class="[baseClass, { active: isActive }]" />
  <div :style="{ color: textColor, fontSize: size + 'px' }" />
  
  <!-- Events -->
  <button @click="handleClick">Click</button>
  <button @click="handleClick(id, $event)">With args</button>
  
  <!-- Modifiers -->
  <form @submit.prevent="onSubmit">
  <input @keyup.enter="submit" />
  <button @click.stop="onClick">Stop propagation</button>
  <button @click.once="onClick">Once only</button>
  
  <!-- Two-way binding -->
  <input v-model="text" />
  <input v-model.trim="text" />
  <input v-model.number="count" />
  <input v-model.lazy="text" />
  
  <!-- HTML -->
  <div v-html="rawHtml"></div>
  <div v-text="text"></div>
  
  <!-- Once (no reactivity) -->
  <span v-once>{{ staticValue }}</span>
</template>
```

## Composables (Custom Hooks)

```js
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  
  function update(e) {
    x.value = e.clientX
    y.value = e.clientY
  }
  
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))
  
  return { x, y }
}

// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)
  
  watchEffect(async () => {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(toValue(url))
      data.value = await res.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })
  
  return { data, error, loading }
}
```

```vue
<script setup>
import { useMouse } from './composables/useMouse'
import { useFetch } from './composables/useFetch'

const { x, y } = useMouse()
const { data, loading, error } = useFetch('/api/users')
</script>
```

## Provide/Inject

```vue
<!-- Parent.vue -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)

// Readonly to prevent child mutation
provide('theme', readonly(theme))
</script>

<!-- Child.vue (any depth) -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const theme = inject('theme', 'light') // with default
</script>
```

## Teleport

```vue
<template>
  <button @click="showModal = true">Open</button>
  
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      Modal content rendered at body
    </div>
  </Teleport>
</template>
```

## Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<!-- AsyncComponent.vue (top-level await) -->
<script setup>
const data = await fetch('/api/data').then(r => r.json())
</script>
```

## Transitions

```vue
<template>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
  
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {
  transition: transform 0.5s ease;
}
</style>
```

## Custom Directives

```vue
<script setup>
// Local directive
const vFocus = {
  mounted: (el) => el.focus()
}

// With arguments
const vColor = {
  mounted: (el, binding) => {
    el.style.color = binding.value
  },
  updated: (el, binding) => {
    el.style.color = binding.value
  }
}
</script>

<template>
  <input v-focus />
  <p v-color="'red'">Colored text</p>
</template>
```

```js
// Global directive (main.js)
app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
})
```

## TypeScript

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
}

const user = ref<User | null>(null)
const users = ref<User[]>([])

const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

// Type for template refs
const inputRef = ref<HTMLInputElement | null>(null)
</script>
```

## Pinia (State Management)

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    // Getter with argument
    countPlusN: (state) => (n) => state.count + n
  },
  
  actions: {
    increment() {
      this.count++
    },
    async fetchData() {
      this.count = await api.getCount()
    }
  }
})

// Composition API style
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()

// Destructure with reactivity
const { count, doubleCount } = storeToRefs(store)
const { increment } = store
</script>

<template>
  <p>{{ count }} x2 = {{ doubleCount }}</p>
  <button @click="increment">+</button>
</template>
```

## Vue Router

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User, props: true },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})
```

```vue
<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Access params
const userId = route.params.id
const query = route.query.search

// Navigate
router.push('/users')
router.push({ name: 'user', params: { id: 1 } })
router.replace('/login')
router.go(-1)
</script>

<template>
  <RouterLink to="/">Home</RouterLink>
  <RouterLink :to="{ name: 'user', params: { id: 1 } }">User</RouterLink>
  <RouterView />
</template>
```

## Options API (Reference)

```vue
<script>
export default {
  props: ['title'],
  emits: ['update'],
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() { return this.count * 2 }
  },
  watch: {
    count(newVal) { console.log(newVal) }
  },
  methods: {
    increment() { this.count++ }
  },
  mounted() { console.log('mounted') }
}
</script>
```

## Script Setup vs Options

| Options API | Composition API (`<script setup>`) |
|-------------|-----------------------------------|
| `data()` | `ref()` / `reactive()` |
| `computed` | `computed()` |
| `watch` | `watch()` / `watchEffect()` |
| `methods` | Regular functions |
| `mounted()` | `onMounted()` |
| `props` | `defineProps()` |
| `emits` | `defineEmits()` |
| `this.$refs` | `ref()` + template ref |
| `this.$emit()` | `emit()` |
