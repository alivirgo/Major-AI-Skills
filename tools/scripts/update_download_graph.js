#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const packageName = process.env.NPM_PACKAGE_NAME || 'major-ai-skills';
const days = 30;

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[char]);
}

function buildChartSvg({
  title,
  subtitle,
  startDate,
  endDate,
  values,
  max,
  status,
  accentColor,
  gradientId,
  ariaLabel,
}) {
  const left = 52;
  const top = 76;
  const chartWidth = 738;
  const chartHeight = 128;

  const points = values.map((value, index) => {
    const x = left + (index * chartWidth) / Math.max(1, values.length - 1);
    const y = top + chartHeight - (value / max) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const area = points ? `${left},${top + chartHeight} ${points} ${left + chartWidth},${top + chartHeight}` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="260" viewBox="0 0 820 260" role="img" aria-label="${escapeXml(ariaLabel)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0d1117"/><stop offset="1" stop-color="#161b22"/></linearGradient>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${accentColor}" stop-opacity=".5"/><stop offset="1" stop-color="${accentColor}" stop-opacity=".03"/></linearGradient>
  </defs>
  <rect width="820" height="260" rx="14" fill="url(#bg)"/>
  <text x="28" y="35" fill="#f0f6fc" font-family="Arial, sans-serif" font-size="19" font-weight="700">${escapeXml(title)}</text>
  <text x="28" y="59" fill="#8b949e" font-family="Arial, sans-serif" font-size="13">${escapeXml(subtitle)}</text>
  <line x1="${left}" y1="${top}" x2="${left}" y2="${top + chartHeight}" stroke="#30363d"/>
  <line x1="${left}" y1="${top + chartHeight}" x2="${left + chartWidth}" y2="${top + chartHeight}" stroke="#30363d"/>
  ${area ? `<polygon points="${area}" fill="url(#${gradientId})"/><polyline points="${points}" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
  <text x="16" y="${top + 5}" fill="#8b949e" font-family="Arial, sans-serif" font-size="11">${max}</text>
  <text x="35" y="${top + chartHeight + 4}" fill="#8b949e" font-family="Arial, sans-serif" font-size="11">0</text>
  <text x="${left}" y="230" fill="#8b949e" font-family="Arial, sans-serif" font-size="11">${escapeXml(startDate)}</text>
  <text x="${left + chartWidth}" y="230" fill="#8b949e" text-anchor="end" font-family="Arial, sans-serif" font-size="11">${escapeXml(endDate)}</text>
  ${status ? `<text x="410" y="145" fill="#d29922" text-anchor="middle" font-family="Arial, sans-serif" font-size="14">${escapeXml(status)}</text>` : ''}
</svg>\n`;
}

async function updateNpmGraph(pkg, dest) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const iso = date => date.toISOString().slice(0, 10);
  const url = `https://api.npmjs.org/downloads/range/${iso(start)}:${iso(end)}/${encodeURIComponent(pkg)}`;

  let downloads = [];
  let status = '';
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'npm-download-graph/1.0' } });
    if (!response.ok) throw new Error(`npm API returned ${response.status}`);
    downloads = (await response.json()).downloads || [];
  } catch (error) {
    status = `Download data is still being indexed (${error.message}).`;
  }

  const values = downloads.map(item => Number(item.downloads) || 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(1, ...values);
  const updated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const svg = buildChartSvg({
    title: `${pkg} · daily npm downloads`,
    subtitle: `Last ${days} days · ${total.toLocaleString('en-US')} downloads · updated ${updated}`,
    startDate: iso(start),
    endDate: iso(end),
    values,
    max,
    status,
    accentColor: '#58a6ff',
    gradientId: 'fill-npm',
    ariaLabel: `Daily npm downloads for ${pkg}`,
  });

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, svg, 'utf8');
  console.log(`Updated ${dest} for ${pkg} (${total} downloads).`);
}

async function updateJsdelivrGraph(pkg, dest) {
  const url = `https://data.jsdelivr.com/v1/stats/packages/npm/${encodeURIComponent(pkg)}?period=month`;
  let entries = [];
  let total = 0;
  let status = '';

  try {
    const response = await fetch(url, { headers: { 'user-agent': 'jsdelivr-download-graph/1.0' } });
    if (!response.ok) throw new Error(`jsDelivr API returned ${response.status}`);
    const data = await response.json();
    entries = Object.entries(data.hits?.dates || {}).sort((a, b) => a[0].localeCompare(b[0]));
    total = Number(data.hits?.total) || entries.reduce((sum, [, count]) => sum + (Number(count) || 0), 0);
  } catch (error) {
    status = `jsDelivr data is still being indexed (${error.message}).`;
  }

  const values = entries.map(([, count]) => Number(count) || 0);
  const max = Math.max(1, ...values);
  const startDate = entries[0]?.[0] || '';
  const endDate = entries[entries.length - 1]?.[0] || '';
  const updated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const svg = buildChartSvg({
    title: `${pkg} · daily jsDelivr requests & hits`,
    subtitle: `Last ${entries.length || days} days · ${total.toLocaleString('en-US')} requests · updated ${updated}`,
    startDate,
    endDate,
    values,
    max,
    status,
    accentColor: '#e84d3d',
    gradientId: 'fill-jsdelivr',
    ariaLabel: `Daily jsDelivr requests and hits for ${pkg}`,
  });

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, svg, 'utf8');
  console.log(`Updated ${dest} for ${pkg} (${total} downloads).`);
}

async function main() {
  const customPath = process.env.DOWNLOAD_GRAPH_PATH;
  const graphType = process.env.GRAPH_TYPE;

  if (customPath) {
    if (graphType === 'jsdelivr' || customPath.includes('jsdelivr')) {
      await updateJsdelivrGraph(packageName, customPath);
    } else {
      await updateNpmGraph(packageName, customPath);
    }
    return;
  }

  // By default, update both npm and jsDelivr graphs
  await updateNpmGraph(packageName, 'assets/npm-downloads.svg');
  await updateJsdelivrGraph(packageName, 'assets/jsdelivr-downloads.svg');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
