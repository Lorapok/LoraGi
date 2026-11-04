import { spawnSync } from 'node:child_process';
import { resolveDeployAuth } from '/mnt/NewVolume/Personal_Projects/cursor-usage-monitor/website/admin/scripts/lib/resolve-deploy-auth.mjs';

async function main() {
  console.log('Resolving Cloudflare deploy auth...');
  const auth = await resolveDeployAuth('/mnt/NewVolume/Personal_Projects/cursor-usage-monitor/website/admin');

  console.log('Deploying dist to Cloudflare Pages (project: loragi, branch: main)...');
  const res = spawnSync(
    'wrangler',
    [
      'pages',
      'deploy',
      'dist',
      '--project-name',
      'loragi',
      '--branch',
      'main',
      '--commit-dirty=true',
    ],
    {
      env: auth.wranglerEnv,
      stdio: 'inherit',
    }
  );

  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
