const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { searchSkills } = require("../bin/search");
const index = require("../../skills_index.json");
const cases = [
  ["held out evaluation dataset", "ai-evaluation-dataset"],
  ["rag retrieval audit", "rag-retrieval-audit"],
  ["JSON schema business rules", "llm-json-contract-check"],
  ["citation verification", "ai-citation-verification"],
  ["PII redaction", "ai-pii-redaction-review"],
  ["injection boundary", "agent-injection-boundary-test"],
  ["tool replay", "agent-tool-replay-test"],
  ["prompt regression", "prompt-regression-gate"],
  ["cost latency benchmark", "llm-cost-latency-benchmark"],
  ["human handoff", "ai-human-handoff-contract"],
  ["ffmpeg transcode video", "ffmpeg"],
];
test("curated discovery queries include the intended skill in the top three", () => {
  for (const [query, expected] of cases) assert.ok(searchSkills(index, query, 3).some(s => s.id === expected), query);
});
test("exact IDs, unknown terms, category filters, and limits", () => {
  assert.equal(searchSkills(index, "blender", 1)[0].id, "blender");
  assert.deepEqual(searchSkills(index, "zxqvunknown"), []);
  assert.deepEqual(searchSkills(index, "blender", 5, "not-a-category"), []);
  assert.deepEqual(searchSkills(index, "help me with ai skills"), []);
});
test("CLI emits parseable bounded JSON and rejects invalid arguments", () => {
  const run = args => spawnSync(process.execPath, [path.resolve(__dirname, "../bin/install.js"), ...args], { encoding: "utf8" });
  const valid = run(["--search", "ffmpeg", "--json", "--limit", "1"]);
  assert.equal(valid.status, 0);
  assert.equal(JSON.parse(valid.stdout).results[0].id, "ffmpeg");
  for (const args of [["--search"], ["--search", ""], ["--search", "x", "--limit", "0"], ["--search", "x", "--all"], ["--json"]]) assert.equal(run(args).status, 1);
});
