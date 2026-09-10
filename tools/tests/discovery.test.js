const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseFrontmatter } = require("../scripts/frontmatter");
const root = path.resolve(__dirname, "../..");

test("YAML parsing preserves quoted punctuation and multiline descriptions", () => {
  const { meta } = parseFrontmatter('---\r\nname: "example"\r\ndescription: >-\r\n  Query CSV: aggregate totals\r\n  and export a report.\r\n---\r\n# Body');
  assert.equal(meta.name, "example");
  assert.equal(meta.description, "Query CSV: aggregate totals and export a report.");
  assert.throws(() => parseFrontmatter('---\nname: one\nname: two\n---\n'), /unique/i);
  assert.throws(() => parseFrontmatter('---\nname: one'), /unterminated/i);
});

test("all canonical skills have one category placement and an exact install command", () => {
  const index = require("../../skills_index.json");
  const config = require("../../skills.sh.json");
  assert(config.groupings.length <= 50);
  assert(config.groupings.every(group => group.title && group.skills.length > 0 && group.skills.length <= 500));
  const canonical = fs.readdirSync(path.join(root, "skills"), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
    .map(entry => entry.name).sort();
  assert.deepEqual(index.map(skill => skill.id).sort(), canonical);
  assert.deepEqual(config.groupings.flatMap(group => group.skills).sort(), canonical);
  const catalog = fs.readFileSync(path.join(root, "CATALOG.md"), "utf8");
  for (const id of canonical) {
    assert.equal(catalog.split('`npx skills add alivirgo/Major-AI-Skills --skill ' + id + '`').length - 1, 1, id);
  }
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets/skill-catalog.js"), "utf8"), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.MAJOR_AI_SKILLS)), index);
});

test("featured workflows point to canonical skills and provide reviewable acceptance criteria", () => {
  const featured = require("../../data/spotlight.json");
  const index = require("../../skills_index.json");
  const ids = new Set(index.map(skill => skill.id));
  assert.equal(new Set(featured.map(entry => entry.id)).size, featured.length);
  for (const entry of featured) {
    assert(ids.has(entry.id));
    assert(entry.prerequisites.length && entry.outputs.length && entry.checks.length);
    assert(entry.prompt && entry.limitations);
  }
});
