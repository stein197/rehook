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
export function useBoolean() {}

// TODO
export function useImage() {}

// TODO
export function useStylesheet() {}

// TODO
export function useScript() {}