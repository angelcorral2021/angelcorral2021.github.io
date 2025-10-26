#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const writeupsDir = path.join(__dirname, '..', 'src', 'content', 'writeups');
const publicImgDir = path.join(__dirname, '..', 'public', 'img');

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function findImageForSlug(slug) {
  if (!fs.existsSync(publicImgDir)) return null;
  const files = fs.readdirSync(publicImgDir);
  const match = files.find(f => f.toLowerCase().startsWith(slug));
  return match || null;
}

function updateHeroInFile(filePath, newHero) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) return false;
  let fm = fmMatch[1];
  if (/^hero:\s*/m.test(fm)) {
    fm = fm.replace(/^hero:.*$/m, `hero: "${newHero}"`);
  } else {
    fm = fm + `\nhero: "${newHero}"`;
  }
  const newContent = content.replace(fmMatch[0], `---\n${fm}\n---\n`);
  fs.writeFileSync(filePath, newContent, 'utf8');
  return true;
}

function main() {
  if (!fs.existsSync(writeupsDir)) {
    console.error('Writeups directory not found:', writeupsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(writeupsDir).filter(f => f.endsWith('.md'));
  let updated = 0;
  files.forEach(f => {
    const full = path.join(writeupsDir, f);
    const content = fs.readFileSync(full, 'utf8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    const basename = path.basename(f, '.md');
    const slug = slugify(basename);
    const img = findImageForSlug(slug);
    if (img) {
      const heroPath = `/img/${img}`;
      // Only update if different
      const currentHeroMatch = fmMatch ? fmMatch[1].match(/^hero:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/m) : null;
      const currentHero = currentHeroMatch ? (currentHeroMatch[1] || currentHeroMatch[2] || currentHeroMatch[3]) : null;
      if (currentHero !== heroPath) {
        const ok = updateHeroInFile(full, heroPath);
        if (ok) {
          console.log(`Updated hero in ${f} -> ${heroPath}`);
          updated++;
        }
      }
    }
  });

  console.log(`Done. Updated ${updated} files.`);
}

main();
