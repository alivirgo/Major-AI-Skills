#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const skillsRoot = path.join(root, "skills");
let errors = 0;

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
  if (!text.startsWith("---")) {
    fail(`${dir.name}: missing YAML frontmatter`);
    continue;
  }
  if (!/^name:\s*.+/m.test(text)) fail(`${dir.name}: missing name`);
  if (!/^description:\s*.+/m.test(text)) fail(`${dir.name}: missing description`);
  const nameMatch = text.match(/^name:\s*(.+)$/m);
  if (nameMatch && nameMatch[1].trim() !== dir.name) {
    fail(`${dir.name}: name frontmatter "${nameMatch[1].trim()}" != folder`);
  }
}

if (errors) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
}
console.log("Validation passed.");
