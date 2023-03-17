import * as React from "react";

// TODO
export function createGlobal<T>(init: T): <T>() => [global: T, setGlobal: (state: T) => void] {
	return <T>(): [global: T, setGlobal: (state: T) => void] => {

	}
}

// TODO
export function useAsync() {}

// TODO
export function usePrevious<T>(value: T): T {
	const ref = React.useRef(value);
	React.useEffect(() => ref.current = value, [value]);
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