import "mocha";
import * as assert from "node:assert";
import * as React from "react";
import * as sandbox from "@stein197/mocha-sandbox";
import * as rehook from ".";

const setTimeout = globalThis.setTimeout;

sandbox(globalThis, sb => {
	describe("createStore()", () => {
		const DEFAULT_NUM = 12;
		const DEFAULT_STR = "string";
		let useStore = rehook.createStore({num: DEFAULT_NUM, str: DEFAULT_STR});
		beforeEach(() => {
			useStore = rehook.createStore({
				num: DEFAULT_NUM,
				str: DEFAULT_STR
			});
		});
		function ComponentStore() {
			const [store, setStore] = useStore();
			return (
				<>
					<p className="store">{JSON.stringify(store)}</p>
					<p className="num">{store.num}</p>
					<p className="str">{store.str}</p>
				</>
			);
		}
		function ComponentNum(): JSX.Element {
			const [num, setNum] = useStore("num");
			return (
				<div className="num">
					<p>{num}</p>
					<button onClick={() => setNum(num * 2)} />
				</div>
			);
		}
		function ComponentStr(): JSX.Element {
			const [str, setStr] = useStore("str");
			return (
				<div className="str">
					<p>{str}</p>
					<button onClick={() => setStr(str + str)} />
				</div>
			);
		}
		it("Should return correct state when using useStore() with a key", async () => {
			await sb.render(<ComponentStore />);
			assert.equal(sb.find(".num")!.textContent, "12");
			assert.equal(sb.find(".str")!.textContent, "string");
			await sb.find(".num-button")!.click();
			await sb.find(".str-button")!.click();
			assert.equal(sb.find(".num p")!.textContent, "24");
			assert.equal(sb.find(".str p")!.textContent, "strstr");
		});
		it("Should return correct state when using useStore() without a key", async () => {
			await sb.render(<ComponentStore />);
			assert.equal(sb.find(".store")!.textContent, "{\"num\":12,\"str\":\"string\"}");
		});
		it("Should always return the same reference to setValue()", async () => {
			let ref;
			function Component() {
				const [num, setNum] = useStore("num");
				const [value, setValue] = React.useState(0);
				ref = setNum;
				return (
					<>
						<p></p>
						<button onClick={() => setValue(value + 1)}>Rerender</button>
					</>
				);
			}
			await sb.render(<Component />);
			const ref1 = ref;
			await sb.findByText("Rerender")!.click();
			const ref2 = ref;
			assert.equal(ref1 === ref2, true);
		});
		it("Should change the value in the store when setStore() is called with a key", async () => {
			await sb.render(<ComponentNum />);
			await sb.find("button")!.click();
			assert.equal(sb.find("p")!.textContent, DEFAULT_NUM * 2);
		});
		it("Shouldn't rerender components that don't use updating key", async () => {
			const trackerNum = new assert.CallTracker();
			const trackerStr = new assert.CallTracker();
			const TrackedComponentNum = trackerNum.calls(ComponentNum, 2);
			const TrackedComponentStr = trackerNum.calls(ComponentStr, 1);
			await sb.render(
				<>
					<TrackedComponentNum />
					<TrackedComponentStr />
				</>
			);
			await sb.find(".num button")!.click();
			trackerNum.verify();
			trackerStr.verify();
		});
		it("Should rerender components that use the same key", async () => {
			function AnotherComponentNum(): JSX.Element {
				const [num] = useStore("num");
				return <div className="another-num">{num}</div>;
			}
			const tracker1 = new assert.CallTracker();
			const tracker2 = new assert.CallTracker();
			const TrackedComponentNum = tracker1.calls(ComponentNum, 2);
			const TrackedAnotherComponentNum = tracker2.calls(AnotherComponentNum, 2);
			await sb.render(
				<>
					<TrackedComponentNum />
					<TrackedAnotherComponentNum />
				</>
			);
			await sb.find("button")!.click();
			tracker1.verify();
			tracker2.verify();
			assert.equal(sb.find(".num p")!.textContent, "24");
			assert.equal(sb.find(".another-num")!.textContent, "24");
		});
		it("Should rerender only once when setState() is called more than once", async () => {
			function Component() {
				const [num, setNum] = useStore("num");
				const [str, setStr] = useStore("str");
				return (
					<>
						<button onClick={() => (setNum(num * 2), setStr(str + str))} />
					</>
				);
			}
			const tracker1 = new assert.CallTracker();
			const tracker2 = new assert.CallTracker();
			const TrackedComponent = tracker1.calls(Component, 2);
			const TrackedComponentStore = tracker2.calls(ComponentStore, 2);
			await sb.render(
				<>
					<TrackedComponent />
					<TrackedComponentStore />
				</>
			);
			await sb.find("button")!.click();
			tracker1.verify();
			tracker2.verify();
			assert.equal(sb.find(".store")!.textContent, "{\"num\":24,\"str\":\"stringstring\"}");
		});
		it.skip("Should rerender component with global store when a single property changes elsewhere", () => {});
		it.skip("Should rerender component with global store when multiple properties change elsewhere", () => {});
		it.skip("Should correcly set store value when updating the whole store", () => {});
		it.skip("Should correcly update values when a callback is passed to setState()", () => {}); // TODO
		it.skip("Complex behavior", () => {});
	});

	// TODO
	describe("useAsync()", () => {});
	
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
const timeout = ms =>  new Promise(rs => setTimeout(rs,ms))