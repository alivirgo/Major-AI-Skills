const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const check = process.argv.includes("--check");
function write(file, content) {
  const destination = path.join(root, file);
  if (check) {
    const matches = fs.existsSync(destination) && (Buffer.isBuffer(content)
      ? fs.readFileSync(destination).equals(content)
      : fs.readFileSync(destination, "utf8").replace(/\r\n/g, "\n") === content.replace(/\r\n/g, "\n"));
    if (!matches) {
      throw new Error(`${file} is stale; run npm run marketplaces`);
    }
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }
}
const json = (file, data) => write(file, JSON.stringify(data, null, 2) + "\n");
const pkg = read("package.json");
const bundles = read("plugins/manifest.json").plugins;
const claude = read(".claude-plugin/marketplace.json");
const entries = [];
for (const bundle of bundles) {
  if (!/^mas-[a-z0-9-]+$/.test(bundle.id)) throw new Error(`Invalid bundle ID: ${bundle.id}`);
  const entry = claude.plugins.find(plugin => plugin.name === bundle.id);
  if (!entry) throw new Error(`Missing Claude marketplace entry: ${bundle.id}`);
  const base = `plugins/${bundle.id}`;
  for (const id of bundle.skills) {
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid skill ID: ${id}`);
    // Ship canonical files inside each plugin: cache installs cannot rely on sibling paths.
    for (const file of fs.readdirSync(path.join(root, "skills", id), { recursive: true })) {
      const source = path.join(root, "skills", id, file);
      if (fs.statSync(source).isFile()) write(`${base}/skills/${id}/${file}`, fs.readFileSync(source, /\.(md|txt|json|yaml|yml|js|py|sh)$/i.test(file) ? "utf8" : undefined));
    }
  }
  const metadata = {
    name: bundle.id, version: pkg.version, description: entry.description,
    author: pkg.author, homepage: pkg.homepage,
    repository: "https://github.com/alivirgo/Major-AI-Skills", license: pkg.license,
  };
  json(`${base}/.claude-plugin/plugin.json`, metadata);
  json(`${base}/.codex-plugin/plugin.json`, {
    ...metadata, skills: "./skills/",
    interface: {
      displayName: bundle.name, shortDescription: entry.description,
      longDescription: entry.description, developerName: pkg.author.name,
      category: "Productivity", websiteURL: pkg.homepage,
      capabilities: ["Write"],
      defaultPrompt: [`Help me plan a task using ${bundle.name}.`],
    },
  });
  entries.push({ name: bundle.id, source: { source: "local", path: `./${base}` },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" }, category: "Productivity" });
}
json(".agents/plugins/marketplace.json", {
  name: "major-ai-skills", interface: { displayName: "Major AI Skills" }, plugins: entries,
});
claude.metadata.version = pkg.version;
json(".claude-plugin/marketplace.json", claude);
const rootPlugin = read(".claude-plugin/plugin.json");
json(".claude-plugin/plugin.json", { ...rootPlugin, version: pkg.version });
const gemini = read("gemini-extension.json");
json("gemini-extension.json", { ...gemini, version: pkg.version });
console.log(`${check ? "Checked" : "Generated"} ${bundles.length} Claude/Codex bundles and Gemini version metadata.`);
