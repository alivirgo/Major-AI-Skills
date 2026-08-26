#!/usr/bin/env node
// Generate CATALOG.md and refresh skills_index.json from skills/<id>/SKILL.md
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const skillsRoot = path.join(root, "skills");

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const meta = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v.startsWith("[") && v.endsWith("]")) {
      try {
        meta[m[1]] = JSON.parse(v.replace(/'/g, '"'));
      } catch {
        meta[m[1]] = v;
      }
    } else {
      meta[m[1]] = v;
    }
  }
  return { meta, body };
}

const index = [];
for (const dir of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith(".")) continue;
  const skillPath = path.join(skillsRoot, dir.name, "SKILL.md");
  if (!fs.existsSync(skillPath)) continue;
  const text = fs.readFileSync(skillPath, "utf8");
  const { meta } = parseFrontmatter(text);
  const variants = {
    gpt: fs.existsSync(path.join(skillsRoot, dir.name, "gpt.md")),
    gemini: fs.existsSync(path.join(skillsRoot, dir.name, "gemini.md")),
  };
  index.push({
    id: meta.name || dir.name,
    path: "skills/" + dir.name,
    category: meta.category || "uncategorized",
    name: meta.name || dir.name,
    description: meta.description || "",
    risk: meta.risk || "safe",
    source: meta.source || "self",
    date_added: meta.date_added || "",
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    tools: Array.isArray(meta.tools) ? meta.tools : [],
    variants,
  });
}

index.sort((a, b) => a.id.localeCompare(b.id));

fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "skills_index.json"),
  JSON.stringify(index, null, 2)
);
fs.writeFileSync(
  path.join(root, "data", "skills_index.json"),
  JSON.stringify(index, null, 2)
);

const byCat = {};
for (const s of index) {
  if (!byCat[s.category]) byCat[s.category] = [];
  byCat[s.category].push(s);
}

const lines = [
  "# Major AI Skills Catalog",
  "",
  "> Generated registry of **" + index.length + "** installable skills.",
  "",
  "Use `skills_index.json` for machine-readable discovery. Each skill lives at `skills/<id>/SKILL.md`.",
  "",
  "## Categories",
  "",
];

for (const cat of Object.keys(byCat).sort()) {
  lines.push("- [" + cat + "](#" + cat + ") — " + byCat[cat].length + " skills");
}
lines.push("");

for (const cat of Object.keys(byCat).sort()) {
  lines.push("## " + cat, "");
  lines.push("| Skill | Description |");
  lines.push("| --- | --- |");
  for (const s of byCat[cat].sort((a, b) => a.id.localeCompare(b.id))) {
    const desc = (s.description || "").replace(/\|/g, "\\|");
    lines.push("| [`" + s.id + "`](" + s.path + "/SKILL.md) | " + desc + " |");
  }
  lines.push("");
}

fs.writeFileSync(path.join(root, "CATALOG.md"), lines.join("\n"));
console.log("Indexed " + index.length + " skills -> skills_index.json + CATALOG.md");
