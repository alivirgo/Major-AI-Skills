#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseFrontmatter } = require("./frontmatter");

const root = path.resolve(__dirname, "..", "..");
const skillsRoot = path.join(root, "skills");
let errors = 0;
const names = new Set();
const categories = new Map();

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

for (const dir of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith(".")) continue;
  const skillMd = path.join(skillsRoot, dir.name, "SKILL.md");
  if (!fs.existsSync(skillMd)) {
    fail(`${dir.name}: missing SKILL.md`);
    continue;
  }
  const text = fs.readFileSync(skillMd, "utf8");
  let meta;
  try {
    ({ meta } = parseFrontmatter(text));
  } catch (error) {
    fail(`${dir.name}: ${error.message}`);
    continue;
  }
  if (meta.name !== dir.name) fail(`${dir.name}: name must match folder`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dir.name) || dir.name.length > 64) {
    fail(`${dir.name}: expected a lowercase, hyphenated skill ID of at most 64 characters`);
  }
  if (names.has(meta.name)) fail(`${dir.name}: duplicate skill name`);
  names.add(meta.name);
  if (typeof meta.description !== "string" || !meta.description.trim() || meta.description.length > 1024) {
    fail(`${dir.name}: description must be a non-empty string of at most 1024 characters`);
  }
  if (meta.metadata?.internal === true) fail(`${dir.name}: canonical public skill is hidden from discovery`);
  if (typeof meta.category !== "string" || !meta.category.trim()) fail(`${dir.name}: missing category`);
  categories.set(meta.category, (categories.get(meta.category) || 0) + 1);
}

if (categories.size > 50) fail("skills.sh supports at most 50 groups");
for (const [category, count] of categories) {
  if (count > 500) fail(`${category}: exceeds skills.sh's 500 skills per group limit`);
}

if (errors) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
}
console.log("Validation passed.");
