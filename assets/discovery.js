function escapeSkillText(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function renderSkillInstall(id) {
  const command = `npx skills add alivirgo/Major-AI-Skills --skill ${id}`;
  return `<div class="skill-install"><code>${escapeSkillText(command)}</code><button class="skill-copy" type="button" data-skill-command="${escapeSkillText(command)}" title="Copy install command for ${escapeSkillText(id)}" aria-label="Copy install command for ${escapeSkillText(id)}"><i data-lucide="copy" aria-hidden="true"></i></button></div>`;
}

function renderSkillSpotlight() {
  return `<figure class="skill-demo"><img class="skill-demo-image" src="assets/spotlight-checkout.png" alt="Playwright reference checkout showing a confirmed demo order" width="1280" height="800" loading="lazy"><figcaption>Local Playwright reference: checkout confirmation. <a href="https://github.com/alivirgo/Major-AI-Skills/blob/master/examples/spotlight/VERIFICATION.md">Verification record</a></figcaption></figure><ul class="skill-spotlight">` + window.MAJOR_AI_SPOTLIGHT.map(entry => {
    const skill = window.MAJOR_AI_SKILLS.find(skill => skill.id === entry.id);
    return `<li class="skill-result"><h3><a href="https://github.com/alivirgo/Major-AI-Skills/blob/master/docs/users/spotlight.md#${entry.id}">${escapeSkillText(entry.title)}</a></h3><p>${escapeSkillText(skill.description)}</p><small>${entry.reference ? "Runnable local reference" : "Application walkthrough"}</small>${renderSkillInstall(entry.id)}</li>`;
  }).join("") + `</ul><p class="skill-copy-status" role="status" aria-live="polite"></p>`;
}

function renderSkillCatalog() {
  const categories = [...new Set(window.MAJOR_AI_SKILLS.map(skill => skill.category))].sort();
  return `<div class="skill-filters"><label>Search skills<input id="skill-query" type="search" placeholder="Product or task" oninput="updateSkillCatalog()"></label><label>Category<select id="skill-category" onchange="updateSkillCatalog()"><option value="">All categories</option>${categories.map(category => `<option value="${escapeSkillText(category)}">${escapeSkillText(category)}</option>`).join("")}</select></label></div><p id="skill-count" role="status"></p><p class="skill-copy-status" role="status" aria-live="polite"></p><ul class="skill-results" id="skill-results"></ul>`;
}

function updateSkillCatalog() {
  const query = document.getElementById("skill-query");
  if (!query) return;
  const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const category = document.getElementById("skill-category").value;
  const matches = window.MAJOR_AI_SKILLS.filter(skill => {
    const text = `${skill.name} ${skill.description} ${skill.tags.join(" ")}`.toLowerCase();
    return (!category || category === skill.category) && words.every(word => text.includes(word));
  });
  document.getElementById("skill-count").textContent = `${matches.length} of ${window.MAJOR_AI_SKILLS.length} skills`;
  document.getElementById("skill-results").innerHTML = matches.length ? matches.map(skill => `<li class="skill-result"><h3><a href="https://github.com/alivirgo/Major-AI-Skills/blob/master/skills/${skill.id}/SKILL.md">${escapeSkillText(skill.name)}</a></h3><small>${escapeSkillText(skill.category)}</small><p>${escapeSkillText(skill.description)}</p>${renderSkillInstall(skill.id)}</li>`).join("") : '<li class="skill-result">No matching skills.</li>';
  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener("click", async event => {
  const button = event.target.closest("[data-skill-command]");
  if (!button) return;
  const command = button.dataset.skillCommand;
  const status = document.querySelector(".skill-copy-status");
  try {
    await navigator.clipboard.writeText(command);
    if (status) status.textContent = "Install command copied.";
    button.title = "Copied";
  } catch {
    const code = button.parentElement.querySelector("code");
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    if (status) status.textContent = "Clipboard unavailable. Command selected.";
    button.title = "Command selected";
  }
});
