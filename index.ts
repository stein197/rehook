import * as React from "react";

/**
 * Simple store implementation. Does not make unnecessary rerenders.
 * @param store Initial state of the store.
 * @returns `useStore()` function.
 * @example
 * ```tsx
 * const useStore = createStore({
 * 	num: 0,
 * 	str: ""
 * });
 * 
 * function ComponentNum() {
 * 	const [num, setNum] = useStore("num");
 * 	return (
 * 		<>
 * 			<p>{num}</p>
 * 			<button onClick={() => setNum(num + 1)}>Increment</button>
 * 		</>
 * 	);
 * }
 * 
 * function ComponentStr() {
 * 	const [str, setStr] = useStore("str");
 * 	return (
 * 		<>
 * 			<p>{str}</p>
 * 			<button onClick={() => setStr(prevStr => prevStr + "A")}>Append A</button>
 * 		</>
 * 	);
 * }
 * ```
 */
export function createStore<T extends object>(store: T): UseStore<T> {
	const listeners = {};
	function update(id: string, state: any) {
		const [queryKey] = listeners[id];
		const newState = state instanceof Function ? state(store[queryKey]) : state;
		if (store[queryKey] === newState)
			return;
		store[queryKey] = newState;
		for (const id in listeners) {
			const [key, setState, force] = listeners[id];
			if (queryKey === key) // replace with equal()
				setState(store[key]);
			if (!key)
				force();
		}
	}
	return ((key?: string) => {
		const [state, setState] = React.useState(key ? store[key] : store);
		const id = React.useId();
		const force = useForce();
		const dispatch = React.useCallback(state => update(id, state), [id]);
		React.useEffect((): () => void => {
			listeners[id] = [key, setState, force];
			return () => delete listeners[id];
		}, [id]);
		return [state, dispatch];
	}) as UseStore<T>;
}

// TODO
export function useAsync() {}

/**
 * Forces rerender.
 * @returns Callback to call in order to rerender a component.
 * @example
 * ```tsx
 * function Component() {
 * 	const force = useForce();
 * 	return (
 * 		<button onClick={force}>Rerender</button>
 * 	);
 * }
 * ```
 */
export function useForce(): () => void {
	const [, dispatch] = React.useReducer(x => ++x, 0);
	return dispatch;
}

/**
 * Saves the previous value.
 * @param value Value to save.
 * @returns Previous value.
 * @example
 * ```tsx
 * function Component() {
 * 	const prev = usePrevious(1);
 * 	return (
 * 		<p>Previous value is: {prev}</p>
 * 	);
 * }
 * ```
 */
export function usePrevious<T>(value: T): T {
	const ref = React.useRef(value);
	React.useEffect(() => void (ref.current = value), [value]);
	return ref.current;
}

/**
 * Creates a boolean that can be toggled.
 * @param init Initial value.
 * @returns An object with hooks.
 * @example
 * ```tsx
 * function Component(props: {init: boolean}): React.ReactNode {
 * 	const bool = useBoolean(props.init);
 * 	return (
 * 		<>
 * 			<p>{bool.value.toString()}</p>
 * 			<button onClick={bool.toggle}>toggle</button>
 * 			<button onClick={bool.setValue}>setValue</button>
 * 			<button onClick={bool.setTrue}>setTrue</button>
 * 			<button onClick={bool.setFalse}>setFalse</button>
 * 		</>
 * 	);
 * }
 * ```
 */
export function useBoolean(init: boolean): UseBooleanReturn {
	const [value, setValue] = React.useState(init);
	return {
		value,
		toggle: React.useCallback(() => setValue(value => !value), []),
		setValue,
		setTrue: React.useCallback(() => setValue(true), []),
		setFalse: React.useCallback(() => setValue(false), [])
	};
}

/**
 * Loads an image.
 * @param url Image URL.
 * @returns Loaded flag and error object.
 * @example
 * ```tsx
 * function Component(): JSX.Element {
 * 	const [loaded, error] = useImage("https://domain.com/image.png");
 * 	return (
 * 		loaded ? <div>Loaded</div> : <div>Loading...</div>
 * 	);
 * }
 * ```
 */
export function useImage(url: string): UseResourceReturn {
	return useResource("img", url);
}

/**
 * Loads a stylesheet.
 * @param url Stylesheet URL.
 * @returns Loaded flag and error object.
 * @example
 * ```tsx
 * function Component(): JSX.Element {
 * 	const [loaded, error] = useStylesheet("https://domain.com/index.css");
 * 	return (
 * 		loaded ? <div>Loaded</div> : <div>Loading...</div>
 * 	);
 * }
 * ```
 */
export function useStylesheet(url: string): UseResourceReturn {
	return useResource("link", url);
}

/**
 * Loads a script.
 * @param url Script URL.
 * @returns Loaded flag and error object.
 * @example
 * ```tsx
 * function Component(): JSX.Element {
 * 	const [loaded, error] = useScript("https://domain.com/index.js");
 * 	return (
 * 		loaded ? <div>Loaded</div> : <div>Loading...</div>
 * 	);
 * }
 * ```
 */
export function useScript(url: string): UseResourceReturn {
	return useResource("script", url);
}

function useResource(type: "img" | "link" | "script", url: string): UseResourceReturn {
	const [loaded, setLoaded] = React.useState(false);
	const [error, setError] = React.useState(null);
	React.useEffect(() => {
		const element = document.createElement(type);
		element.onerror = e => {
			setLoaded(false);
			setError(e);
		}
		element.onload = () => {
			setLoaded(true);
			setError(null);
		}
		if (type === "link") {
			// @ts-ignore
			element.href = url;
			// @ts-ignore
			element.rel = "stylesheet"
		} else {
			// @ts-ignore
			element.src = url;
		}
		if (type !== "img")
			document.head.appendChild(element);
		return () => {
			setLoaded(false);
			setError(null);
			element.remove();
		}
	}, [url]);
	return [loaded, error];
}

interface UseStore<T extends object> {
	<K extends keyof T>(key: K): [store: T[K], setStore: (store: T[K] | ((prev: T[K]) => T[K])) => void];
	(): [store: T, setStore: (store: T) => void];
}

type UseBooleanReturn = {
	value: boolean;
	toggle(): void;
	setValue(value: boolean): void;
	setTrue(): void;
	setFalse(): void;
}

type UseResourceReturn = [loaded: boolean, error: any];
