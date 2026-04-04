#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

const PREVIEW_SUFFIX = '.preview.sable.css';
const FULL_SUFFIX = '.sable.css';
const THEMES_DIR = 'themes';
const TWEAKS_DIR = 'tweaks';

const repo =
  process.env.GITHUB_REPOSITORY?.trim() ||
  process.env.CATALOG_REPOSITORY?.trim() ||
  'SableClient/themes';
const ref = process.env.GITHUB_REF_NAME?.trim() || process.env.CATALOG_REF?.trim() || 'main';

function rawFileUrl(relativePath) {
  return `https://raw.githubusercontent.com/${repo}/${ref}/${relativePath}`;
}

function buildCatalog() {
  const themesPath = path.join(REPO_ROOT, THEMES_DIR);
  if (!fs.existsSync(themesPath) || !fs.statSync(themesPath).isDirectory()) {
    console.warn(`missing ${THEMES_DIR}/ directory`);
  }
  const files = fs.existsSync(themesPath) ? fs.readdirSync(themesPath) : [];
  const previewFiles = files.filter((f) => f.endsWith(PREVIEW_SUFFIX));

  const themes = [];
  for (const previewName of previewFiles) {
    const basename = previewName.slice(0, -PREVIEW_SUFFIX.length);
    const fullName = `${basename}${FULL_SUFFIX}`;
    if (!files.includes(fullName)) {
      console.warn(`skip ${THEMES_DIR}/${previewName}: missing ${fullName}`);
      continue;
    }
    const prevRel = `${THEMES_DIR}/${previewName}`;
    const fullRel = `${THEMES_DIR}/${fullName}`;
    themes.push({
      basename,
      previewUrl: rawFileUrl(prevRel),
      fullUrl: rawFileUrl(fullRel),
    });
  }

  themes.sort((a, b) => a.basename.localeCompare(b.basename));

  const tweaks = [];
  const tweaksPath = path.join(REPO_ROOT, TWEAKS_DIR);
  if (fs.existsSync(tweaksPath) && fs.statSync(tweaksPath).isDirectory()) {
    for (const name of fs.readdirSync(tweaksPath)) {
      if (!name.endsWith(FULL_SUFFIX)) continue;
      const basename = name.slice(0, -FULL_SUFFIX.length);
      tweaks.push({
        basename,
        fullUrl: rawFileUrl(`${TWEAKS_DIR}/${name}`),
      });
    }
    tweaks.sort((a, b) => a.basename.localeCompare(b.basename));
  }

  return {
    version: 1,
    repository: repo,
    ref,
    themes,
    tweaks,
  };
}

const catalog = buildCatalog();
const outPath = path.join(REPO_ROOT, 'catalog.json');
fs.writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(
  `Wrote ${outPath} (${catalog.themes.length} theme pairs, ${catalog.tweaks.length} tweaks)`
);
