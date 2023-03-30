import * as React from "react";
import * as sandbox from "@stein197/test-sandbox";
import * as rehook from ".";

const setTimeoutOriginal = globalThis.setTimeout;

sandbox(globalThis, sb => {
	describe("useAsync()", () => {
		function Component(props: {promise: Promise<any> | (() => Promise<any>)}): JSX.Element {
			// @ts-ignore
			const [state, value, error, run] = rehook.useAsync(props.promise);
			return (
				<>
					<p className="state">{String(state)}</p>
					<p className="value">{String(value)}</p>
					<p className="error">{String(error)}</p>
					<button onClick={run}>Run</button>
				</>
			);
		}
		describe("useAsync(promise)", () => {
			it("Should return pending state and undefined as result and error right after initialization", () => sb
				.render(<Component promise={timeout(100)} />)
				.equals(sb => sb.find(".state")!.textContent, "pending")
				.equals(sb => sb.find(".value")!.textContent, "undefined")
				.equals(sb => sb.find(".error")!.textContent, "undefined")
				.run()
			);
			it("Should return fulfilled state, an expected result and undefined as an error when the promise is resolved", () => {
				const promise = timeout(100, "fulfilled", "result", "error");
				return sb
					.render(<Component promise={promise} />)
					.await(promise)
					.equals(sb => sb.find(".state")!.textContent, "fulfilled")
					.equals(sb => sb.find(".value")!.textContent, "result")
					.equals(sb => sb.find(".error")!.textContent, "undefined")
					.run()
			});
			it("Should return rejected state, undefined as a result and an error when the promise is rejected", () => {
				const promise = timeout(100, "rejected", "result", "error");
				return sb
					.render(<Component promise={promise} />)
					.await(promise)
					.equals(sb => sb.find(".state")!.textContent, "rejected")
					.equals(sb => sb.find(".value")!.textContent, "undefined")
					.equals(sb => sb.find(".error")!.textContent, "error")
					.run()
			});
			it("Should reset state when a new promise is passed", () => {
				function Component1(): JSX.Element {
					const [promise, setPromise] = React.useState(timeout(100, "fulfilled", "result", "error"));
					return (
						<>
							<Component promise={promise} />
							<button onClick={() => setPromise(timeout(100, "fulfilled", "result", "error"))}>Update</button>
						</>
					);
				}
				return sb
					.render(<Component1 />)
					.timeout(150)
					.equals(sb => sb.find(".state")!.textContent, "fulfilled")
					.equals(sb => sb.find(".value")!.textContent, "result")
					.equals(sb => sb.find(".error")!.textContent, "undefined")
					.simulate(sb => sb.findByText("Update")!, "click")
					.equals(sb => sb.find(".state")!.textContent, "pending")
					.equals(sb => sb.find(".value")!.textContent, "undefined")
					.equals(sb => sb.find(".error")!.textContent, "undefined")
					.run()
			});
		});

		describe("useAsync(() => promise)", () => {
			it("Should not run promise function when the runner is not called", () => sb
				.render(<Component promise={() => timeout(100)} />)
				.timeout(150)
				.equals(sb => sb.find(".state")!.textContent, "pending")
				.equals(sb => sb.find(".value")!.textContent, "undefined")
				.equals(sb => sb.find(".error")!.textContent, "undefined")
				.run()
			);
			it("Should return pending state and undefined as result and error right after initialization", () => sb
				.render(<Component promise={() => timeout(100)} />)
				.simulate(sb => sb.find("button")!, "click")
				.equals(sb => sb.find(".state")!.textContent, "pending")
				.equals(sb => sb.find(".value")!.textContent, "undefined")
				.equals(sb => sb.find(".error")!.textContent, "undefined")
				.run()
			);
			it("Should return fulfilled state, an expected result and undefined as an error when the callback is fired and the promise is resolved", () => {
				const promise = timeout(100, "fulfilled", "result", "error");
				return sb
					.render(<Component promise={() => promise} />)
					.simulate(sb => sb.find("button")!, "click")
					.await(promise)
					.equals(sb => sb.find(".state")!.textContent, "fulfilled")
					.equals(sb => sb.find(".value")!.textContent, "result")
					.equals(sb => sb.find(".error")!.textContent, "undefined")
					.run();
			});
			it("Should return rejected state, undefined as a result and an error when the callback is fired and the promise is resolved", () => {
				const promise = timeout(100, "rejected", "result", "error");
				return sb
					.render(<Component promise={() => promise} />)
					.simulate(sb => sb.find("button")!, "click")
					.await(promise)
					.equals(sb => sb.find(".state")!.textContent, "rejected")
					.equals(sb => sb.find(".value")!.textContent, "undefined")
					.equals(sb => sb.find(".error")!.textContent, "error")
					.run();
			});
			it("Should reset state when a new callback is passed", () => {
				function Component1(): JSX.Element {
					const [promise, setPromise] = React.useState<any>(() => timeout(100, "fulfilled", "result", "error"));
					return (
						<>
							<Component promise={promise} />
							<button onClick={() => setPromise(() => () => timeout(100, "fulfilled", "result", "error"))}>Update</button>
						</>
					);
				}
				return sb
					.render(<Component1 />)
					.simulate(sb => sb.findByText("Run")!, "click")
					.timeout(150)
					.equals(sb => sb.find(".state")!.textContent, "fulfilled")
					.equals(sb => sb.find(".value")!.textContent, "result")
					.equals(sb => sb.find(".error")!.textContent, "undefined")
					.simulate(sb => sb.findByText("Update")!, "click")
					.equals(sb => sb.find(".state")!.textContent, "pending")
					.equals(sb => sb.find(".value")!.textContent, "undefined")
					.equals(sb => sb.find(".error")!.textContent, "undefined")
					.run()
			});
		});
	});
	
	describe("useForce()", () => {
		function Component() {
			const force = rehook.useForce();
			return (
				<button onClick={force}>Rerender</button>
			);
		}
		it("Should rerender each time whenever the callback is called", () => sb
			.render(<Component />)
			.simulate(sb => sb.find("button")!, "click")
			.simulate(sb => sb.find("button")!, "click")
			.rerenders(3)
			.run()
		);
	});

	describe("usePrevious()", () => {
		function Component() {
			const [value, setValue] = React.useState(0);
			const prev = rehook.usePrevious(value);
			return (
				<>
					<p>prev: {prev}, cur: {value}</p>
					<button onClick={() => setValue(value + 1)} />
				</>
			);
		}
		it("Should correctly save previous value", () => sb
			.render(<Component />)
			.equals(sb => sb.find("p")!.textContent, "prev: 0, cur: 0")
			.simulate(sb => sb.find("button")!, "click")
			.equals(sb => sb.find("p")!.textContent, "prev: 0, cur: 1")
			.simulate(sb => sb.find("button")!, "click")
			.equals(sb => sb.find("p")!.textContent, "prev: 1, cur: 2")
			.run()
		);
	});

	describe("useBoolean()", () => {
		function Component(props: {init: boolean}): JSX.Element {
			const bool = rehook.useBoolean(props.init);
			return (
				<>
					<p>{bool.value.toString()}</p>
					<button onClick={bool.toggle}>toggle</button>
					<button onClick={bool.setTrue}>setTrue</button>
					<button onClick={bool.setFalse}>setFalse</button>
				</>
			);
		}
		it("Should toggle the value when calling toggle()", () => sb
			.render(<Component init={true} />)
			.equals(sb => sb.find("p")!.textContent, "true")
			.simulate(sb => sb.findByText("toggle")!, "click")
			.equals(sb => sb.find("p")!.textContent, "false")
			.simulate(sb => sb.findByText("toggle")!, "click")
			.equals(sb => sb.find("p")!.textContent, "true")
			.run()
		);
		it("Should always set to true when calling setTrue()", () => sb
			.render(<Component init={false} />)
			.equals(sb => sb.find("p")!.textContent, "false")
			.simulate(sb => sb.findByText("setTrue")!, "click")
			.equals(sb => sb.find("p")!.textContent, "true")
			.simulate(sb => sb.findByText("setTrue")!, "click")
			.equals(sb => sb.find("p")!.textContent, "true")
			.run()
		);
		it("Should always set to false when calling setFalse()", () => sb
			.render(<Component init={true} />)
			.equals(sb => sb.find("p")!.textContent, "true")
			.simulate(sb => sb.findByText("setFalse")!, "click")
			.equals(sb => sb.find("p")!.textContent, "false")
			.simulate(sb => sb.findByText("setFalse")!, "click")
			.equals(sb => sb.find("p")!.textContent, "false")
			.run()
		);
	});
});

function timeout<T>(ms: number, state: "fulfilled" | "rejected" = "fulfilled", resolvedValue?: T, rejectedValue?: any): Promise<T | undefined> {
	return new Promise((resolve, reject) => {
		setTimeoutOriginal(() => {
			if (state === "fulfilled")
				resolve(resolvedValue);
			else
				reject(rejectedValue);
		}, ms);
	});
}
