# React 18+ — Archaiforge Quick Reference

## Hooks

### State

```jsx
import { useState, useReducer } from 'react';

// Simple state
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', age: 0 });

// Functional update (when depending on previous)
setCount(prev => prev + 1);
setUser(prev => ({ ...prev, name: 'Alice' }));

// Lazy initialization
const [data, setData] = useState(() => expensiveComputation());

// Reducer for complex state
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'INCREMENT' });
```

### Effects

```jsx
import { useEffect, useLayoutEffect } from 'react';

// Run on mount + deps change
useEffect(() => {
  fetchData();
}, [id]);

// Cleanup
useEffect(() => {
  const sub = subscribe(id);
  return () => sub.unsubscribe();
}, [id]);

// Run once on mount
useEffect(() => {
  init();
}, []);

// Synchronous DOM measurement (before paint)
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
}, []);
```

### Refs

```jsx
import { useRef, forwardRef, useImperativeHandle } from 'react';

// DOM reference
const inputRef = useRef(null);
<input ref={inputRef} />
inputRef.current.focus();

// Mutable value (no re-render)
const countRef = useRef(0);
countRef.current++;

// Forward ref to child
const Input = forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));

// Expose custom handle
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current.focus(),
  clear: () => inputRef.current.value = ''
}));
```

### Memoization

```jsx
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive computation
const sorted = useMemo(() => 
  items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// Memoize callback (stable reference)
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize component
const ExpensiveList = memo(({ items }) => (
  <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
));
```

### Context

```jsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

// Provider
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// Consumer
const theme = useContext(ThemeContext);
```

### Custom Hooks

```jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(url)
      .then(r => r.json())
      .then(d => !cancelled && setData(d))
      .catch(e => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    
    return () => { cancelled = true; };
  }, [url]);
  
  return { data, loading, error };
}
```

## Component Patterns

### Function Components

```jsx
// Basic
function Button({ children, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// With TypeScript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button className={variant} onClick={onClick}>{children}</button>;
}
```

### Composition

```jsx
// Compound components
function Tabs({ children, defaultTab }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = ({ children }) => <div className="tabs">{children}</div>;
Tabs.Tab = ({ id, children }) => {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button 
      className={active === id ? 'active' : ''} 
      onClick={() => setActive(id)}
    >
      {children}
    </button>
  );
};
Tabs.Panel = ({ id, children }) => {
  const { active } = useContext(TabsContext);
  return active === id ? <div>{children}</div> : null;
};

// Usage
<Tabs defaultTab="a">
  <Tabs.List>
    <Tabs.Tab id="a">Tab A</Tabs.Tab>
    <Tabs.Tab id="b">Tab B</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="a">Content A</Tabs.Panel>
  <Tabs.Panel id="b">Content B</Tabs.Panel>
</Tabs>
```

### Render Props

```jsx
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  
  return render(pos);
}

// Usage
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

## Event Handling

```jsx
<button onClick={handleClick}>Click</button>
<button onClick={() => handleClick(id)}>With arg</button>
<button onClick={(e) => { e.preventDefault(); submit(); }}>Submit</button>

<input onChange={(e) => setName(e.target.value)} />
<form onSubmit={(e) => { e.preventDefault(); save(); }}>
<div onKeyDown={(e) => e.key === 'Enter' && submit()} />
```

## Conditional Rendering

```jsx
// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// AND operator
{hasItems && <ItemList items={items} />}

// Early return
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
return <Content data={data} />;

// Switch/object lookup
const components = {
  loading: <Spinner />,
  error: <Error />,
  success: <Content />
};
return components[status];
```

## Lists

```jsx
// Basic
{items.map(item => (
  <Item key={item.id} {...item} />
))}

// With index (only if no stable id)
{items.map((item, index) => (
  <Item key={index} {...item} />
))}

// Fragments for adjacent elements
{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </Fragment>
))}
```

## Forms

```jsx
// Controlled
function Form() {
  const [values, setValues] = useState({ email: '', password: '' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" type="password" value={values.password} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}

// Uncontrolled with ref
function Form() {
  const emailRef = useRef();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(emailRef.current.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Error Boundaries

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    logError(error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## React 18 Features

### Suspense

```jsx
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./Heavy'));

<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

### Transitions

```jsx
import { useTransition, useDeferredValue } from 'react';

// Mark state updates as non-urgent
const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  setInput(e.target.value); // Urgent
  startTransition(() => {
    setSearchResults(filter(e.target.value)); // Non-urgent
  });
};

// Defer a value
const deferredQuery = useDeferredValue(query);
```

### Concurrent Features

```jsx
// Automatic batching (React 18)
// These updates are batched automatically
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Only one re-render
}, 1000);

// useId for SSR-safe unique IDs
const id = useId();
<label htmlFor={id}>Email</label>
<input id={id} />
```

## Performance Patterns

```jsx
// Virtualization for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>

// Code splitting
const AdminPanel = lazy(() => import('./AdminPanel'));

// Debounced updates
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debounced;
}
```

## TypeScript Patterns

```tsx
// Props with children
interface CardProps {
  title: string;
  children: React.ReactNode;
}

// Event handlers
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}

// Discriminated unions for state
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };
```
