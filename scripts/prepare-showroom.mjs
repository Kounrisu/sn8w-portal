import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(
  await readFile(new URL('./showroom-catalog.json', import.meta.url), 'utf8'),
);
const sql = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const statements = [
  '-- Run AFTER 007 and AFTER the image assets have been deployed. UTF-8.',
  '-- Existing gallery selections and visibility are preserved on re-import.',
  'SET NAMES utf8mb4;',
  'START TRANSACTION;',
];
const preview = [];
const report = [
  '# Project screenshot inventory',
  '',
  'Captured 2026-09-14. Original browser captures are in output/playwright (local QA). Optimized WebP files are identical in each project’s docs/images/projects and this portal’s docs/images/projects/<slug>. Angular publishes the latter as /images/projects/<slug>.',
  '',
  '| Project folder | Screens | Source / limitation |',
  '| --- | ---: | --- |',
];
for (const [index, project] of catalog.entries()) {
  const files = [];
  for (const image of project.images) {
    const destination = path.join(root, 'docs/images/projects', project.slug);
    const own = path.resolve(root, '..', project.folder, 'docs/images/projects');
    await mkdir(destination, { recursive: true });
    await mkdir(own, { recursive: true });
    const filename = image + '.webp';
    await sharp(path.join(root, 'output/playwright', image + '.png'))
      .webp({ quality: 84 })
      .toFile(path.join(destination, filename));
    for (const [variant, width] of [
      ['thumb', 192],
      ['preview', 720],
    ]) {
      const variantName = `${image}.${variant}.webp`;
      await sharp(path.join(root, 'output/playwright', image + '.png'))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(destination, variantName));
      if (project.folder !== '08-sn8w-portal')
        await copyFile(path.join(destination, variantName), path.join(own, variantName));
    }
    if (project.folder !== '08-sn8w-portal')
      await copyFile(path.join(destination, filename), path.join(own, filename));
    files.push(`/images/projects/${project.slug}/${filename}`);
  }
  const match = project.existingId
    ? `id = ${project.existingId} AND name = ${sql(project.name)}`
    : `name = ${sql(project.name)}`;
  if (!project.existingId) {
    statements.push(
      `INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT ${sql(project.name)}, ${sql(project.category)}, ${sql(project.tagline)}, 'ecosystem', ${sql(project.status ?? 'prototype')}, 'inactive', ${index + 10}, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = ${sql(project.name)});`,
    );
  }
  if (files.length) {
    statements.push(
      `UPDATE projects SET screenshot = ${sql(files[0])}, screenshots = ${sql(JSON.stringify(files.slice(1)))}${project.existingId ? ', show_in_showcase = 1' : ''} WHERE ${match} AND screenshots IS NULL;`,
    );
  }
  if (project.existingId && project.tagline) {
    const previousDescription = project.previousTagline
      ? ` OR tagline = ${sql(project.previousTagline)}`
      : '';
    statements.push(
      `UPDATE projects SET category = ${sql(project.category)}, tagline = ${sql(project.tagline)}, status = 'in-development' WHERE ${match} AND (tagline = '' OR tagline = 'Pick an image, choose a style, watch it transform.'${previousDescription});`,
    );
  }
  if (project.categoryFr && project.taglineFr) {
    statements.push(
      `INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', ${sql(project.categoryFr)}, ${sql(project.taglineFr)} FROM projects WHERE ${match} ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);`,
    );
  }
  preview.push({ ...project, files });
  report.push(`| ${project.folder ?? project.name + ' (planned)'} | ${files.length} | ${project.source} |`);
}
statements.push('COMMIT;', '');
await writeFile(
  path.join(root, 'api/migrations/008_showroom_catalog.sql'),
  statements.join('\n\n'),
);
await writeFile(path.join(root, 'docs/project-screenshot-inventory.md'), report.join('\n') + '\n');
await writeFile(
  path.join(root, 'scripts/showroom-preview.json'),
  JSON.stringify(preview, null, 2) + '\n',
);
console.log(
  `Prepared ${catalog.length} catalog entries and ${preview.reduce((sum, p) => sum + p.files.length, 0)} screenshots.`,
);
