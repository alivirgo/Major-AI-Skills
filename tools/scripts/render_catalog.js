const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);

function renderCatalog(skills) {
  const categories = [...new Set(skills.map(skill => skill.category))].sort();
  const sections = categories.map(category => `<section id="category-${escapeHtml(category)}">
<h2>${escapeHtml(category)}</h2>
${skills.filter(skill => skill.category === category).map(skill => `<article id="${escapeHtml(skill.id)}">
<h3><a href="#${escapeHtml(skill.id)}">${escapeHtml(skill.name)}</a></h3>
<p>${escapeHtml(skill.description)}</p>
<pre><code>npx skills add alivirgo/Major-AI-Skills --skill ${escapeHtml(skill.id)}</code></pre>
<a href="https://github.com/alivirgo/Major-AI-Skills/blob/master/${escapeHtml(skill.path)}/SKILL.md">Read skill instructions</a>
</article>`).join("\n")}
</section>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Major AI Skills Catalog | ${skills.length} Agent Skills</title>
<meta name="description" content="Browse ${skills.length} product-specific agent skills with source instructions and exact install commands for Claude Code, Codex, Cursor, and other agents.">
<link rel="canonical" href="https://alivirgo.github.io/Major-AI-Skills/catalog.html">
<meta property="og:title" content="Major AI Skills Catalog">
<meta property="og:description" content="${skills.length} agent skills with source instructions and exact install commands.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://alivirgo.github.io/Major-AI-Skills/catalog.html">
<meta property="og:image" content="https://alivirgo.github.io/Major-AI-Skills/assets/og-card.png">
<link rel="stylesheet" href="assets/seo.css">
<style>
h1{font-size:32px;letter-spacing:0}h2{font-size:24px}h3{font-size:18px}
article{border-bottom:1px solid var(--border);padding:12px 0 24px;scroll-margin-top:20px}
article:target{border-left:3px solid var(--accent);padding-left:16px}
nav ul{display:flex;flex-wrap:wrap;gap:12px 24px;padding-left:20px}
pre{white-space:pre-wrap;overflow-wrap:anywhere}p,h1,h2,h3,a{overflow-wrap:anywhere}
</style>
</head>
<body><main class="wrap">
<a class="brand" href="index.html">Major AI Skills</a>
<h1>Major AI Skills Catalog</h1>
<p class="lead">${skills.length} skills across ${categories.length} categories.</p>
<p><a href="https://github.com/alivirgo/Major-AI-Skills/blob/master/docs/users/spotlight.md">Featured workflows</a> | <a href="https://skills.sh/alivirgo/major-ai-skills">skills.sh listing</a></p>
<nav aria-label="Skill categories"><ul>${categories.map(category => `<li><a href="#category-${escapeHtml(category)}">${escapeHtml(category)}</a></li>`).join("")}</ul></nav>
${sections}
<footer><a href="index.html">Major AI Skills</a> | <a href="skills_index.json">Machine-readable registry</a></footer>
</main></body></html>
`;
}

module.exports = { renderCatalog };
