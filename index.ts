import React from "react";

// TODO
export function createGlobal<T>(init: T): <T>() => [global: T, setGlobal: (state: T) => void] {
	return <T>(): [global: T, setGlobal: (state: T) => void] => {

	}
}

// TODO
export function useAsync() {}

// TODO
export function usePrevious() {}

// TODO
export function useBoolean(init: boolean) {
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
export function useImage() {}

// TODO
export function useStylesheet() {}

// TODO
export function useScript() {}