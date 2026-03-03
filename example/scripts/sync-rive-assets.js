#!/usr/bin/env node

/**
 * Syncs .riv files from assets/rive/ (single source of truth) to:
 * - ios/Assets/         (Xcode references most files here)
 * - ios/                (Xcode references some files from the ios/ root directly)
 * - android/app/src/main/res/raw/
 *
 * Run automatically before `npm run ios` and `npm run android`, or manually:
 *   npm run sync-rive
 *
 * Android: destination filenames are normalized to [a-z0-9_.] (lowercase, hyphens → underscores).
 * iOS: files are copied as-is to both ios/Assets/ AND ios/ root (for files Xcode resolves
 * from the root). New .riv files in assets/rive/ must still be added to the Xcode project
 * (Add Files → Copy Bundle Resources) once so they are included in the app bundle.
 *
 * WHY COPY TO ios/ ROOT: Some .riv files were added to Xcode with path = "filename.riv"
 * (relative to the ios/ group root) rather than "Assets/filename.riv". Xcode packages
 * from whichever path is in project.pbxproj, so both locations must stay in sync.
 */

const fs = require('fs');
const path = require('path');

const exampleDir = path.resolve(__dirname, '..');
const sourceDir = path.join(exampleDir, 'assets', 'rive');
const iosDir = path.join(exampleDir, 'ios', 'Assets');
const iosRootDir = path.join(exampleDir, 'ios');
const androidDir = path.join(exampleDir, 'android', 'app', 'src', 'main', 'res', 'raw');

function androidResourceName(basename) {
  return basename
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_.]/g, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sync() {
  if (!fs.existsSync(sourceDir)) {
    console.log('sync-rive: no assets/rive/ directory, skipping.');
    return;
  }

  const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.riv'));
  if (files.length === 0) {
    console.log('sync-rive: no .riv files in assets/rive/, skipping.');
    return;
  }

  ensureDir(iosDir);
  ensureDir(androidDir);

  let copiedAssets = 0;
  let copiedRoot = 0;
  for (const file of files) {
    const src = path.join(sourceDir, file);
    const basename = path.basename(file, '.riv');

    // Always copy to ios/Assets/ (where Xcode references most files from)
    const iosDest = path.join(iosDir, file);
    fs.copyFileSync(src, iosDest);
    copiedAssets++;

    // Also copy to ios/ root for any file that Xcode references from there
    // (files whose project.pbxproj entry has path = "filename.riv" with no Assets/ prefix)
    const iosRootDest = path.join(iosRootDir, file);
    if (fs.existsSync(iosRootDest)) {
      fs.copyFileSync(src, iosRootDest);
      copiedRoot++;
    }

    const androidBasename = androidResourceName(basename) + '.riv';
    const androidDest = path.join(androidDir, androidBasename);
    fs.copyFileSync(src, androidDest);
  }

  console.log(
    `sync-rive: synced ${copiedAssets} .riv file(s) to ios/Assets, ` +
    `${copiedRoot} to ios/ root (Xcode root-referenced), and all to android/.../res/raw/`
  );
}

try {
  sync();
} catch (err) {
  console.error('sync-rive:', err.message);
  process.exit(1);
}
