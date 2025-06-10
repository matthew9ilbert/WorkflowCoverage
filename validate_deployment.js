import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function verifyPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`).toString();
    if (result) throw new Error(`Port ${port} conflict`);
  } catch (e) {
    if (!e.message.includes('findstr')) throw e;
  }
}

async function validate() {
  // Verify critical files exist
  const requiredFiles = [
    'client/vite.config.js',
    'client/netlify.toml',
    'windsurf_deployment.yaml'
  ];

  // Check Docker Compose configuration
  const dockerConfig = fs.readFileSync('windsurf_deployment.yaml', 'utf8');
  if (!dockerConfig.includes('version: \'3.8\'')) {
    throw new Error('Invalid Docker Compose version');
  }

  // Verify all required ports are exposed
  const requiredPorts = [3000, 5000];
  requiredPorts.forEach(port => {
    if (!dockerConfig.includes(`"${port}"`)) {
      throw new Error(`Port ${port} not exposed`);
    }
  });

  // Verify port conflicts
  requiredPorts.forEach(port => {
    verifyPort(port);
  });

  console.log('✅ All deployment configurations validated');
}

validate().catch(err => {
  console.error('❌ Validation failed:', err.message);
  process.exit(1);
});
