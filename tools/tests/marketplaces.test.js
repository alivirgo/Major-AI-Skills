const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

test("marketplace bundles expose canonical skills and synchronized versions", () => {
  const version = read("package.json").version;
  const bundles = read("plugins/manifest.json").plugins;
  const marketplace = read(".agents/plugins/marketplace.json");
  assert.deepEqual(marketplace.plugins.map(p => p.name), bundles.map(b => b.id));
  for (const bundle of bundles) {
    const base = `plugins/${bundle.id}`;
    const entry = marketplace.plugins.find(p => p.name === bundle.id);
    assert.equal(entry.source.path, `./${base}`);
    assert.equal(entry.policy.installation, "AVAILABLE");
    for (const host of ["claude", "codex"]) {
      const manifest = read(`${base}/.${host}-plugin/plugin.json`);
      assert.equal(manifest.name, bundle.id);
      assert.equal(manifest.version, version);
      assert.ok(manifest.author.name);
    }
    assert.deepEqual(fs.readdirSync(path.join(root, base, "skills")).sort(), [...bundle.skills].sort());
    for (const id of bundle.skills) {
      const content = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
      assert.equal(content(`${base}/skills/${id}/SKILL.md`), content(`skills/${id}/SKILL.md`));
    }
  }
  const gemini = read("gemini-extension.json");
  assert.equal(gemini.version, version);
  assert.ok(fs.existsSync(path.join(root, gemini.contextFileName)));
});
