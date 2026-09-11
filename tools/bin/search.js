const STOP = new Set("a an the to for with my me i want need help how can of and in on using ai skill skills".split(" "));
const tokens = value => [...new Set(String(value).toLowerCase().match(/[a-z0-9]+/g) || [])].filter(t => !STOP.has(t));

function searchSkills(index, query, limit = 5, category) {
  const terms = tokens(query);
  if (!terms.length) return [];
  return index.filter(s => !category || category.split(",").includes(s.category)).map(skill => {
    const id = new Set(tokens(skill.id));
    const tags = new Set(tokens((skill.tags || []).join(" ")));
    const description = new Set(tokens(skill.description));
    const matched = terms.filter(t => id.has(t) || tags.has(t) || description.has(t));
    const score = matched.reduce((sum, t) => sum + (id.has(t) ? 8 : tags.has(t) ? 4 : 1), 0)
      + (skill.id === query.trim().toLowerCase() ? 100 : 0);
    return { skill, score, matched };
  }).filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.id.localeCompare(b.skill.id))
    .slice(0, limit).map(({ skill, matched }) => ({
      id: skill.id, description: skill.description, category: skill.category,
      matchedTerms: matched,
      source: `https://github.com/alivirgo/Major-AI-Skills/blob/master/${skill.path}/SKILL.md`,
      install: `npx skills add alivirgo/Major-AI-Skills --skill ${skill.id}`,
    }));
}
module.exports = { searchSkills };
