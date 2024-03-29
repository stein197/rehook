import * as React from "react";

/**
 * Awaits for the promise to resolve.
 * @param promise Promise to resolve.
 * @returns State, value and error of the promise.
 * @example
 * ```tsx
 * function Component() {
 * 	const [state, value, error] = usePromise(new Promise((resolve, reject) => setTimeout(() => Math.random() > .5 ? resolve() : reject(), 1000)));
 * 	return (
 * 		<>
 * 			{state == "pending" && <p>Loading...</p>}
 * 			{state == "fulfilled" && value != null && <p>Value: {value}</p>}
 * 			{state == "rejected" && error != null && <p>Error: {error}</p>}
 * 		</>
 * 	);
 * }
 * ```
 */
export function useAsync<T, U>(promise: Promise<T>): UsePromise<T, U, false>;

/**
 * Gets a function that must return a promise and calls it on demand, which starts the process of resolving the promise.
 * @param cb Callback that must return a promise.
 * @returns State, value, error of the promise and a function to run the resolution.
 * @example
 * ```tsx
 * function Component() {
 * 	const [state, value, error, run] = usePromise(() => new Promise((resolve, reject) => setTimeout(() => Math.random() > .5 ? resolve() : reject(), 1000)));
 * 	return (
 * 		<>
 * 			{state == "pending" && <p>Loading...</p>}
 * 			{state == "fulfilled" && value != null && <p>Value: {value}</p>}
 * 			{state == "rejected" && error != null && <p>Error: {error}</p>}
 * 			<button onClick={run}>Run promise</button>
 * 		</>
 * 	);
 * }
 * ```
 */
export function useAsync<T, U>(cb: () => Promise<T>): UsePromise<T, U, true>;

export function useAsync<T, U>(a: Promise<T> | (() => Promise<T>)): UsePromise<T, U, boolean> {
	const [state, setState] = React.useState<PromiseState>("pending");
	const [value, setValue] = React.useState<T>();
	const [error, setError] = React.useState<U>();
	const isPromise = a instanceof Promise;
	const run = React.useCallback(() => {
		if (isPromise)
			return;
		a().then(value => {
			setState("fulfilled");
			setValue(value);
			setError(undefined);
		}).catch(error => {
			setState("rejected");
			setValue(undefined);
			setError(error);
		});
	}, [a]);
	React.useEffect(() => {
		if (!isPromise)
			return;
		a.then(value => {
			setState("fulfilled");
			setValue(value);
			setError(undefined);
		}).catch(error => {
			setState("rejected");
			setValue(undefined);
			setError(error);
		});
	}, [a]);
	React.useEffect(() => {
		return () => {
			setState("pending");
			setValue(undefined);
			setError(undefined);
		}
	}, [a]);
	return [state, value, error, run];
}

/**
 * Creates a boolean that can be toggled, switched, set.
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
		toggle: React.useCallback(() => setValue(value => !value), [init]),
		setValue,
		setTrue: React.useCallback(() => setValue(true), [init]),
		setFalse: React.useCallback(() => setValue(false), [init])
	};
}

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
 * 	const [state, setState] = React.useState(0);
 * 	const prev = usePrevious(state);
 * 	return (
 * 		<>
 * 			<p>Previous value is: {prev}</p>
 * 			<p>Current value is: {state}</p>
 * 			<button onClick={() => setState(x => ++x)}>Increment</button>
 * 		</>
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
 * Read, write and subscribe on sessionStorage.
 * @param key Key by which to read and write the data.
 * @returns Current value and setter for the value.
 * @example
 * ```tsx
 * function Component(props: {key: string}) {
 * 	const [value, setValue] = useSessionStorage(props.key);
 * 	return (
 * 		<div>
 * 			<p>Key: {props.key}</p>
 * 			<p>Value: {value}</p>
 * 			<button onClick={() => setValue((value ?? 0) + 1)}>Increase</button>
 * 		</div>
 * 	);
 * }
 * ```
 */
export function useSessionStorage<T>(key: string): UseStorageReturn<T> {
	return useStorage("sessionStorage", key);
}

/**
 * Read, write and subscribe on localStorage.
 * @param key Key by which to read and write the data.
 * @returns Current value and setter for the value.
 * @example
 * ```tsx
 * function Component(props: {key: string}) {
 * 	const [value, setValue] = useLocalStorage(props.key);
 * 	return (
 * 		<div>
 * 			<p>Key: {props.key}</p>
 * 			<p>Value: {value}</p>
 * 			<button onClick={() => setValue((value ?? 0) + 1)}>Increase</button>
 * 		</div>
 * 	);
 * }
 * ```
 */
export function useLocalStorage<T>(key: string): UseStorageReturn<T> {
	return useStorage("localStorage", key);
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

function useStorage<T>(type: "localStorage" | "sessionStorage", key: string): UseStorageReturn<T> {
	const storage = globalThis[type];
	const [value, setValue] = React.useState(tryJSONParse(storage.getItem(key)));
	const set = React.useCallback((v: T) => {
		if (v == null)
			storage.removeItem(key);
		else
			storage.setItem(key, JSON.stringify(v));
		setValue(v);
	}, [type, key]);
	React.useEffect(() => {
		function onStorage(e: StorageEvent): void {
			if (e.storageArea !== storage || e.key !== key)
				return;
			setValue(tryJSONParse(e.newValue));
		}
		globalThis.addEventListener("storage", onStorage);
		return () => globalThis.removeEventListener("storage", onStorage);
	}, [type, key]);
	return [value, set];
}

function tryJSONParse(value: string): object | string {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

type UsePromise<T, U, V extends boolean> = [state: PromiseState, value: T | undefined, error: U | undefined, run: V extends true ? (() => void) : never];

type UseBooleanReturn = {

	/**
	 * Current value.
	 */
	value: boolean;

	/**
	 * Changes the value to the opposite.
	 */
	toggle(): void;

	/**
	 * Sets the value.
	 * @param value Value to set.
	 */
	setValue(value: boolean): void;

	/**
	 * Sets the value to `true`.
	 */
	setTrue(): void;

	/**
	 * Sets the value to `false`.
	 */
	setFalse(): void;
}

type UseResourceReturn = [loaded: boolean, error: any];

type UseStorageReturn<T> = [value: T | null, setValue: (value: T | null) => void];

type PromiseState = "pending" | "fulfilled" | "rejected";
