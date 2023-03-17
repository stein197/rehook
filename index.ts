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
 * Save the previous value.
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

// TODO
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

// TODO
export function useImage(url: string): UseImageReturn {
	const [loaded, setLoaded] = React.useState(false);
	const [error, setError] = React.useState(null);
	React.useEffect(() => {
		const img = new Image();
		img.onerror = e => {
			setLoaded(false);
			setError(e);
		}
		img.onload = () => {
			setLoaded(true);
			setError(null);
		}
		img.src = url;
		return () => {
			setLoaded(false);
			setError(null);
		}
	}, [url]);
	return [loaded, error];
}

// TODO
export function useStylesheet(url: string): UseStylesheetReturn {
	const [loaded, setLoaded] = React.useState(false);
	const [error, setError] = React.useState(null);
	React.useEffect(() => {
		const linkElement = document.createElement("link");
		linkElement.onerror = e => {
			setLoaded(false);
			setError(e);
		}
		linkElement.onload = () => {
			setLoaded(true);
			setError(null);
		}
		linkElement.rel = "stylesheet";
		linkElement.href = url;
		document.head.appendChild(linkElement);
		return () => {
			setLoaded(false);
			setError(null);
			linkElement.remove();
		}
	}, [url]);
	return [loaded, error];
}

// TODO
export function useScript(url: string): UseScriptReturn {
	const [loaded, setLoaded] = React.useState(false);
	const [error, setError] = React.useState(null);
	React.useEffect(() => {
		const scriptElement = document.createElement("script");
		scriptElement.onerror = e => {
			setLoaded(false);
			setError(e);
		}
		scriptElement.onload = () => {
			setLoaded(true);
			setError(null);
		}
		scriptElement.src = url;
		document.head.appendChild(scriptElement);
		return () => {
			setLoaded(false);
			setError(null);
			scriptElement.remove();
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

type UseImageReturn = [loaded: boolean, error: any];

type UseStylesheetReturn = [loaded: boolean, error: any];

type UseScriptReturn = [loaded: boolean, error: any];