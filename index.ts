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
 * Awaits for the promise to resolve.
 * @param cb Callback that must return a promise.
 * @returns State, value, error of the promise and a function to run promise.
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

type UsePromise<T, U, V extends boolean> = [state: PromiseState, value: T | undefined, error: U | undefined, run: V extends true ? (() => void) : never];

type UseBooleanReturn = {
	value: boolean;
	toggle(): void;
	setValue(value: boolean): void;
	setTrue(): void;
	setFalse(): void;
}

type UseResourceReturn = [loaded: boolean, error: any];

type PromiseState = "pending" | "fulfilled" | "rejected";
