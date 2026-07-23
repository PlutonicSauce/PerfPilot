import test from "node:test";
import assert from "node:assert/strict";

test("report presents provenance alongside every displayed benchmark metric", async () => {
  const source = await (await import("node:fs/promises")).readFile("lib/report.ts", "utf8");
  assert.match(source, /provenance: "measured"/);
  assert.match(source, /provenance: "estimated"/);
});
