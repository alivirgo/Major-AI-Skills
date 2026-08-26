#!/usr/bin/env node
/**
 * Publish @alivirgo/major-ai-skills to GitHub Packages without changing the
 * public npmjs package name (major-ai-skills).
 *
 * Requires: gh auth with write:packages, or NODE_AUTH_TOKEN / GH_TOKEN.
 *
 * Usage: node tools/scripts/publish-github-packages.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const pkgPath = path.join(root, 'package.json');
const backupPath = path.join(root, 'package.json.bak-npm');
const npmrcPath = path.join(root, '.npmrc.github');

function token() {
  if (process.env.NODE_AUTH_TOKEN || process.env.GH_TOKEN) {
    return process.env.NODE_AUTH_TOKEN || process.env.GH_TOKEN;
  }
  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('Set NODE_AUTH_TOKEN / GH_TOKEN or run: gh auth login (write:packages)');
  }
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
fs.copyFileSync(pkgPath, backupPath);
pkg.name = '@alivirgo/major-ai-skills';
pkg.publishConfig = { access: 'public', registry: 'https://npm.pkg.github.com' };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const t = token();
fs.writeFileSync(
  npmrcPath,
  `@alivirgo:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${t}\n`
);

try {
  execSync(`npm publish --userconfig "${npmrcPath}" --registry https://npm.pkg.github.com --access public`, {
    cwd: root,
    stdio: 'inherit',
  });
  console.log('\nPublished @alivirgo/major-ai-skills to GitHub Packages.');
  console.log('If the package is private, set Public in:');
  console.log('https://github.com/users/alivirgo/packages/npm/major-ai-skills/settings');
} finally {
  fs.copyFileSync(backupPath, pkgPath);
  fs.unlinkSync(backupPath);
  try {
    fs.unlinkSync(npmrcPath);
  } catch {
    /* ignore */
  }
}
