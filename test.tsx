import "mocha";
import * as assert from "node:assert";
import * as React from "react";
import * as sandbox from "@stein197/mocha-sandbox";
import * as Rehook from ".";

sandbox(globalThis, sb => {
	// TODO
	describe("createGlobal()", () => {});

	// TODO
	describe("useAsync()", () => {});

	describe("usePrevious()", () => {
		function Component() {
			const [value, setValue] = React.useState(0);
			const prev = Rehook.usePrevious(value);
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

	// TODO
	describe("useBoolean()", () => {});

	// TODO
	describe("useImage()", () => {});

	// TODO
	describe("useStylesheet()", () => {});

	// TODO
	describe("useScript()", () => {});
});
