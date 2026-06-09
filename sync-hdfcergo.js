const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OWNER = 'Rakeshjupalli';
const REPO = 'playwright-automation-tests';
const TARGET_DIR = 'hdfc-ergo-playwright';
const SOURCE_DIR = path.resolve(__dirname, 'hdfcergo');

// ── Helpers ──────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { stdio: 'inherit', encoding: 'utf-8', ...opts });
  } catch (e) {
    if (!opts.fatal === false) process.exit(1);
    throw e;
  }
}

function runSilent(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', ...opts }).trim();
  } catch (e) {
    return '';
  }
}

function copyRecursive(src, dest, ignorePatterns = []) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);

      if (ignorePatterns.some(p => srcPath.includes(p))) continue;

      copyRecursive(srcPath, destPath, ignorePatterns);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const tmpDir = path.join(__dirname, '.sync-tmp');
  const repoUrl = `https://github.com/${OWNER}/${REPO}.git`;

  console.log(`\n🚀 Syncing hdfcergo → ${OWNER}/${REPO}:${TARGET_DIR}\n`);

  // 1. Validate source exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // 2. Clean or create temp clone directory
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tmpDir, { recursive: true });

  // 3. Clone the target repo (sparse or full)
  console.log('\n📦 Cloning target repository...\n');
  const hasToken = !!process.env.GITHUB_TOKEN;
  const cloneUrl = hasToken
    ? `https://${process.env.GITHUB_TOKEN}@github.com/${OWNER}/${REPO}.git`
    : repoUrl;

  try {
    run(`git clone --depth 1 ${cloneUrl} ${tmpDir}`, { fatal: false });
  } catch {
    console.error(`❌ Failed to clone ${repoUrl}`);
    console.error('   Make sure the repo exists and you have access.');
    console.error('   Set GITHUB_TOKEN env var for private repos.');
    process.exit(1);
  }

  // 4. Remove old target dir inside repo if it exists
  const targetPath = path.join(tmpDir, TARGET_DIR);
  if (fs.existsSync(targetPath)) {
    console.log(`\n🗑️  Removing existing ${TARGET_DIR} in target repo...\n`);
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  // 5. Copy hdfcergo files into target repo
  console.log(`\n📂 Copying files to ${TARGET_DIR}...\n`);
  const ignored = ['node_modules', 'test-results', 'reports', '.last-run.json'];
  copyRecursive(SOURCE_DIR, targetPath, ignored);

  // 6. Check if there are changes
  const status = runSilent('git status --porcelain', { cwd: tmpDir });
  if (!status) {
    console.log('\n✅ Target repo already up-to-date. Nothing to commit.\n');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return;
  }

  // 7. Stage, commit, and optionally push
  console.log('\n📝 Committing changes...\n');
  run('git add .', { cwd: tmpDir });

  const commitMsg = `sync(hdfcergo): Update hdfc-ergo-playwright from monorepo (${new Date().toISOString().split('T')[0]})`;
  run(`git commit -m "${commitMsg}"`, { cwd: tmpDir });

  console.log('\n✅ Sync complete. Review the commit in:');
  console.log(`   ${tmpDir}\n`);

  // 8. Auto-push if GITHUB_TOKEN or user confirms
  if (hasToken) {
    console.log('🚀 Pushing to remote...\n');
    run(`git push origin HEAD`, { cwd: tmpDir });
    console.log(`\n✅ Pushed to ${repoUrl}\n`);
  } else {
    console.log('💡 To push manually, run:');
    console.log(`   cd ${tmpDir}`);
    console.log('   git push origin HEAD\n');
  }

  // 9. Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('🧹 Cleaned up temp directory.\n');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
