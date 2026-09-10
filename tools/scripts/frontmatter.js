const YAML = require("yaml");

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("Missing or unterminated YAML frontmatter");
  const document = YAML.parseDocument(match[1]);
  if (document.errors.length) throw new Error(document.errors[0].message);
  const meta = document.toJS();
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    throw new Error("Frontmatter must be a mapping");
  }
  return { meta, body: text.slice(match[0].length) };
}

module.exports = { parseFrontmatter };
