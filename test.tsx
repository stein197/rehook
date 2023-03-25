import "mocha";
import * as assert from "node:assert";
import * as React from "react";
import * as sandbox from "@stein197/mocha-sandbox";
import * as rehook from ".";
const ReactDOMTestUtils = require("react-dom/test-utils");

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
					<button onClick={run} />
				</>
			);
		}
		describe("useAsync(promise)", () => {
			it("Should return pending state and undefined as result and error right after initialization", async () => {
				const promise = timeout(100, "fulfilled", "result", "error");
				await sb.render(<Component promise={promise} />);
				assert.equal(sb.find(".state")!.textContent, "pending");
				assert.equal(sb.find(".value")!.textContent, "undefined");
				assert.equal(sb.find(".error")!.textContent, "undefined");
			});
			it("Should return fulfilled state, an expected result and undefined as an error when the promise is resolved", async () => {
				const promise = timeout(100, "fulfilled", "result", "error");
				await sb.renderAsync(<Component promise={promise} />, promise);
				assert.equal(sb.find(".state")!.textContent, "fulfilled");
				assert.equal(sb.find(".value")!.textContent, "result");
				assert.equal(sb.find(".error")!.textContent, "undefined");
			});
			it("Should return rejected state, undefined as a result and an error when the promise is rejected", async () => {
				const promise = timeout(100, "rejected", "result", "error");
				await sb.renderAsync(<Component promise={promise} />, promise);
				assert.equal(sb.find(".state")!.textContent, "rejected");
				assert.equal(sb.find(".value")!.textContent, "undefined");
				assert.equal(sb.find(".error")!.textContent, "error");
			});
			it.skip("Should reset state when a new promise is passed", async () => {});
		});

		describe("useAsync(() => promise)", () => {
			it("Should not run promise function when the runner is not called", async () => {
				const promise = timeout(100);
				await sb.render(<Component promise={() => promise} />);
				await timeout(200);
				assert.equal(sb.find(".state")!.textContent, "pending");
				assert.equal(sb.find(".value")!.textContent, "undefined");
				assert.equal(sb.find(".error")!.textContent, "undefined");
			});
			it("Should return pending state and undefined as result and error right after initialization", async () => {
				const promise = timeout(100);
				await sb.render(<Component promise={() => promise} />);
				await sb.find("button")!.click();
				assert.equal(sb.find(".state")!.textContent, "pending");
				assert.equal(sb.find(".value")!.textContent, "undefined");
				assert.equal(sb.find(".error")!.textContent, "undefined");
			});
			it("Should return fulfilled state, an expected result and undefined as an error when the callback is fired and the promise is resolved", async () => {
				const promise = timeout(100, "fulfilled", "result", "error");
				await sb.render(<Component promise={() => promise} />);
				await sb.find("button")!.click();
				await timeout(100);
				assert.equal(sb.find(".state")!.textContent, "fulfilled");
				assert.equal(sb.find(".value")!.textContent, "result");
				assert.equal(sb.find(".error")!.textContent, "undefined");
			});
			it("Should return rejected state, undefined as a result and an error when the callback is fired and the promise is resolved", async () => {
				const promise = timeout(100, "rejected", "result", "error");
				await sb.render(<Component promise={() => promise} />);
				await sb.find("button")!.click();
				await timeout(200);
				assert.equal(sb.find(".state")!.textContent, "rejected");
				assert.equal(sb.find(".value")!.textContent, "undefined");
				assert.equal(sb.find(".error")!.textContent, "error");
			});
			it.skip("Should reset state when a new callback is passed", async () => {});
		});
	});
	
	describe("useForce()", () => {
		function Component() {
			const force = rehook.useForce();
			return (
				<button onClick={force}>Rerender</button>
			);
		}
		it("Should rerender each time whenever the callback is called", async () => {
			const tracker = new assert.CallTracker();
			const TrackedComponent = tracker.calls(Component, 3);
			await sb.render(<TrackedComponent />);
			await sb.find("button")!.click();
			await sb.find("button")!.click();
			tracker.verify();
		});
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
		it("Should correctly save previous value", async () => {
			await sb.render(<Component />);
			assert.equal(sb.find("p")!.textContent, "prev: 0, cur: 0");
			await sb.find("button")!.click();
			assert.equal(sb.find("p")!.textContent, "prev: 0, cur: 1");
			await sb.find("button")!.click();
			assert.equal(sb.find("p")!.textContent, "prev: 1, cur: 2");
		});
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
		it("Should toggle the value when calling toggle()", async () => {
			await sb.render(<Component init={true} />);
			assert.equal(sb.find("p")!.textContent, "true");
			await sb.findByText("toggle")!.click();
			assert.equal(sb.find("p")!.textContent, "false");
			await sb.findByText("toggle")!.click();
			assert.equal(sb.find("p")!.textContent, "true");
		});
		it("Should always set to true when calling setTrue()", async () => {
			await sb.render(<Component init={false} />);
			assert.equal(sb.find("p")!.textContent, "false");
			await sb.findByText("setTrue")!.click();
			assert.equal(sb.find("p")!.textContent, "true");
			await sb.findByText("setTrue")!.click();
			assert.equal(sb.find("p")!.textContent, "true");
		});
		it("Should always set to false when calling setFalse()", async () => {
			await sb.render(<Component init={true} />);
			assert.equal(sb.find("p")!.textContent, "true");
			await sb.findByText("setFalse")!.click();
			assert.equal(sb.find("p")!.textContent, "false");
			await sb.findByText("setFalse")!.click();
			assert.equal(sb.find("p")!.textContent, "false");
		});
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
