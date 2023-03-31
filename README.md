# Rehook
A collection of React hooks.

## Installation
```
npm install @stein197/rehook
```

## Hooks

### useAsync()
Awaits for the promise to resolve.
```tsx
function useAsync<T, U>(promise: Promise<T>): UsePromise<T, U, false>;
```

Gets a function that must return a promise and calls it on demand, which starts the process of resolving the promise.
```tsx
function useAsync<T, U>(cb: () => Promise<T>): UsePromise<T, U, true>;
```

### useBoolean()
Creates a boolean that can be toggled, switched, set.
```tsx
function useBoolean(init: boolean): UseBooleanReturn;
```

### useForce()
Forces rerender.
```tsx
function useForce(): () => void;
```

### usePrevious()
Saves the previous value.
```tsx
function usePrevious<T>(value: T): T;
```

### useImage()
Loads an image.
```tsx
function useImage(url: string): UseResourceReturn;
```

### useScript()
Loads a script.
```tsx
function useScript(url: string): UseResourceReturn;
```

### useStylesheet()
Loads a stylesheet.
```tsx
function useStylesheet(url: string): UseResourceReturn;
```

## NPM script
- `clean`. Delete all generated files
- `build`. Build the project
- `test`. Run unit tests
