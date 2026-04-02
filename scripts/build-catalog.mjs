#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

const PREVIEW_SUFFIX = '.preview.sable.css';
const FULL_SUFFIX = '.sable.css';

const repo =
  process.env.GITHUB_REPOSITORY?.trim() ||
  process.env.CATALOG_REPOSITORY?.trim() ||
  'SableClient/themes';
const ref = process.env.GITHUB_REF_NAME?.trim() || process.env.CATALOG_REF?.trim() || 'main';

function rawFileUrl(fileName) {
  return `https://raw.githubusercontent.com/${repo}/${ref}/${fileName}`;
}

function buildCatalog() {
  const files = fs.readdirSync(REPO_ROOT);
  const previewFiles = files.filter((f) => f.endsWith(PREVIEW_SUFFIX));

  const themes = [];
  for (const previewName of previewFiles) {
    const basename = previewName.slice(0, -PREVIEW_SUFFIX.length);
    const fullName = `${basename}${FULL_SUFFIX}`;
    if (!files.includes(fullName)) {
      console.warn(`skip ${previewName}: missing ${fullName}`);
      continue;
    }
    themes.push({
      basename,
      previewUrl: rawFileUrl(previewName),
      fullUrl: rawFileUrl(fullName),
    });
  }

  themes.sort((a, b) => a.basename.localeCompare(b.basename));

  return {
    version: 1,
    repository: repo,
    ref,
    themes,
  };
}

const catalog = buildCatalog();
const outPath = path.join(REPO_ROOT, 'catalog.json');
fs.writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath} (${catalog.themes.length} theme pairs)`);
