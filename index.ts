import * as React from "react";

// TODO: Make no rerenders when deep object is changing. Possibly use callback in useGlobal()
export function createGlobal<T extends object>(global: T): () => [global: T, setGlobal: (state: Partial<T>) => void] {
	const dispatchArray = [];
	function reducer(curState, newState) {
		return global = {...curState, ...newState}; // TODO: Use deep merge and do not merge non-plain objects
	}
	function updateGlobal(state) {
		for (const dispatch of dispatchArray)
			dispatch(state);
	}
	return () => {
		const [state, dispatch] = React.useReducer(reducer, global);
		React.useEffect(() => {
			dispatchArray.push(dispatch);
			return () => {
				const dispatchIdx = dispatchArray.indexOf(dispatch);
				dispatchArray.splice(dispatchIdx, 1);
			}
		}, []);
		return [state, updateGlobal];
	}
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
	const [, dispatch] = React.useReducer(x => x + 1, 0);
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

type UseBooleanReturn = {
	value: boolean;
	toggle(): void;
	setValue(value: boolean): void;
	setTrue(): void;
	setFalse(): void;
}

type UseResourceReturn = [loaded: boolean, error: any];
