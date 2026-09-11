// Public aggregate counters only; this does not collect installer or agent telemetry.
async function read(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "major-ai-skills-adoption-audit" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { source: url, data: await response.json() };
  } catch (error) { return { source: url, error: error.message }; }
}
(async () => {
  const npm = await read("https://api.npmjs.org/downloads/point/last-week/major-ai-skills");
  const github = await read("https://api.github.com/repos/alivirgo/Major-AI-Skills");
  console.log(JSON.stringify({
    observedAt: new Date().toISOString(),
    npm: npm.error ? npm : { source: npm.source, downloads: npm.data.downloads, start: npm.data.start, end: npm.data.end },
    github: github.error ? github : { source: github.source, stars: github.data.stargazers_count, forks: github.data.forks_count },
    skillsSh: { source: "https://skills.sh/alivirgo/major-ai-skills", status: "manual-rendered-page-check-required" },
    interpretation: "Downloads are not unique users or agent executions. Stars are not installations. Missing data is unknown, not zero.",
  }, null, 2));
  if (npm.error || github.error) process.exitCode = 1;
})();
