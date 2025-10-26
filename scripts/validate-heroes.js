#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { resolve } from 'path';

// recrear __dirname y __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ejemplo de uso:
const ruta = resolve(__dirname, '../data/heroes.json');
console.log('Ruta absoluta:', ruta);

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const writeupsDir = join(__dirname, '..', 'src', 'content', 'writeups');

function checkHeroPath(hero) {
  if (!hero) return false;
  if (hero.startsWith('/')) hero = hero.slice(1);
  const p = join(__dirname, '..', hero);
  return existsSync(p);
}

function main() {
  if (!existsSync(writeupsDir)) {
    console.error('Writeups directory not found:', writeupsDir);
    process.exit(1);
  }

  const files = readdirSync(writeupsDir).filter(f => f.endsWith('.md'));
  let missing = 0;
  files.forEach(f => {
    const full = join(writeupsDir, f);
    const content = readFileSync(full, 'utf8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fmMatch) return;
    const fm = fmMatch[1];
    const heroMatch = fm.match(/^hero:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/m);
    const hero = heroMatch ? (heroMatch[1] || heroMatch[2] || heroMatch[3]) : null;
    if (hero) {
      const exists = checkHeroPath(hero);
      if (!exists) {
        console.warn(`Missing hero for ${f}: ${hero}`);
        missing++;
      }
    }
  });
  if (missing > 0) {
    console.error(`Validation failed: ${missing} hero references missing.`);
    process.exit(2);
  }
  console.log('All hero references are valid.');
}

main();
