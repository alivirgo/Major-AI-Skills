#!/usr/bin/env node
/**
 * Lightweight multi-host installer inspired by agentic-awesome-skills style.
 * Copies selected (or all) skills into the target agent's skills directory.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = path.resolve(__dirname, "..", "..");
const skillsRoot = path.join(root, "skills");

const TARGETS = {
  antigravity: path.join(os.homedir(), ".agents", "skills"),
  cursor: path.join(os.homedir(), ".cursor", "skills"),
  claude: path.join(os.homedir(), ".claude", "skills"),
  codex: path.join(os.homedir(), ".codex", "skills"),
  gemini: path.join(os.homedir(), ".gemini", "skills"),
  agy: path.join(os.homedir(), ".gemini", "antigravity-cli", "skills"),
  kiro: path.join(os.homedir(), ".kiro", "skills"),
  opencode: path.join(process.cwd(), ".agents", "skills"),
};

function parseArgs(argv) {
  const args = {
    target: null,
    path: null,
    skills: null,
    category: null,
    dryRun: false,
    all: false,
    list: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--all") args.all = true;
    else if (a === "--list") args.list = true;
    else if (a === "--antigravity") args.target = "antigravity";
    else if (a === "--cursor") args.target = "cursor";
    else if (a === "--claude") args.target = "claude";
    else if (a === "--codex") args.target = "codex";
    else if (a === "--gemini") args.target = "gemini";
    else if (a === "--agy") args.target = "agy";
    else if (a === "--kiro") args.target = "kiro";
    else if (a === "--opencode") args.target = "opencode";
    else if (a === "--path") args.path = argv[++i];
    else if (a === "--skills") args.skills = argv[++i];
    else if (a === "--category") args.category = argv[++i];
  }
  return args;
}

function loadIndex() {
  const p = path.join(root, "skills_index.json");
  if (!fs.existsSync(p)) {
    console.error("Missing skills_index.json. Run: npm run index");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function resolveDest(args) {
  if (args.path) return path.resolve(args.path);
  if (args.target && TARGETS[args.target]) return TARGETS[args.target];
  return TARGETS.antigravity;
}

function copyDir(src, dest, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to, dryRun);
    else fs.copyFileSync(from, to);
  }
}

function printHelp() {
  console.log(`Major AI Skills installer

Usage:
  npx major-ai-skills --cursor --skills raycast,ffmpeg
  npx major-ai-skills --antigravity --category macos --dry-run
  npx major-ai-skills --claude --all
  npx major-ai-skills --path ./my-skills --skills solidworks
  npx major-ai-skills --list

Targets:
  --antigravity  ~/.agents/skills (default; prefer --skills to avoid overload)
  --cursor       ~/.cursor/skills
  --claude       ~/.claude/skills
  --codex        ~/.codex/skills
  --gemini       ~/.gemini/skills
  --agy          ~/.gemini/antigravity-cli/skills
  --kiro         ~/.kiro/skills
  --opencode     ./.agents/skills
  --path <dir>   custom destination

Filters:
  --skills a,b,c   exact skill IDs
  --category x,y   category filter (AND with --skills when both set)
  --all            install every skill (explicit consent)
  --dry-run        preview only
  --list           print catalog summary
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) return printHelp();

  const index = loadIndex();
  if (args.list) {
    const byCat = {};
    for (const s of index) (byCat[s.category] ||= []).push(s.id);
    for (const cat of Object.keys(byCat).sort()) {
      console.log(`\n${cat} (${byCat[cat].length})`);
      console.log(byCat[cat].sort().join(", "));
    }
    console.log(`\nTotal: ${index.length}`);
    return;
  }

  let selected = index;
  if (args.skills) {
    const wanted = new Set(
      args.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    selected = selected.filter((s) => wanted.has(s.id));
    const missing = [...wanted].filter((id) => !selected.find((s) => s.id === id));
    if (missing.length) {
      console.error(`Unknown skill IDs: ${missing.join(", ")}`);
      process.exit(1);
    }
  }
  if (args.category) {
    const cats = new Set(
      args.category
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    selected = selected.filter((s) => cats.has(s.category));
  }

  const destRoot = resolveDest(args);
  const isAntigravityDefault =
    !args.path && (!args.target || args.target === "antigravity");

  if (isAntigravityDefault && !args.skills && !args.category && !args.all) {
    console.error(
      "Antigravity watches ~/.agents/skills. Refusing full install without --skills, --category, or --all."
    );
    console.error("Preview example: npx major-ai-skills --antigravity --skills raycast,ffmpeg --dry-run");
    process.exit(1);
  }

  if (!args.skills && !args.category && !args.all) {
    // Non-antigravity hosts: require explicit consent for full catalog
    console.error("Provide --skills, --category, or --all.");
    process.exit(1);
  }

  console.log(`Destination: ${destRoot}`);
  console.log(`Skills to install: ${selected.length}`);
  if (args.dryRun) console.log("(dry-run - no files written)");

  for (const s of selected) {
    const src = path.join(root, s.path);
    const dest = path.join(destRoot, s.id);
    console.log(`${args.dryRun ? "PLAN" : "COPY"} ${s.id} -> ${dest}`);
    if (!fs.existsSync(path.join(src, "SKILL.md"))) {
      console.error(`Missing SKILL.md for ${s.id}`);
      process.exit(1);
    }
    copyDir(src, dest, args.dryRun);
  }

  console.log(args.dryRun ? "Dry-run complete." : "Install complete.");
  console.log(`Try: @${selected[0]?.id || "skill-id"} help me with ...`);
}

main();
