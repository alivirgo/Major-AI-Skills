const test = require("node:test");
const assert = require("node:assert/strict");
const { renderCatalog } = require("../scripts/render_catalog");

test("static catalog escapes metadata and exposes source and install links without JavaScript", () => {
  const html = renderCatalog([{ id: "example", name: "Example <script>", category: "a&b", description: 'Use "quoted" <input>', path: "skills/example" }]);
  assert.ok(html.includes('id="example"'));
  assert.ok(html.includes('href="#example"'));
  assert.ok(html.includes("Example &lt;script&gt;"));
  assert.ok(html.includes("Use &quot;quoted&quot; &lt;input&gt;"));
  assert.ok(html.includes("npx skills add alivirgo/Major-AI-Skills --skill example"));
  assert.ok(html.includes("https://github.com/alivirgo/Major-AI-Skills/blob/master/skills/example/SKILL.md"));
  assert.ok(!html.includes("<script>"));
});
