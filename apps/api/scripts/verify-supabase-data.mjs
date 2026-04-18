import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { parseTableSelection } from './data-migration-config.mjs';
import { loadApiEnv, preferDirectDatabaseUrl } from './load-api-env.mjs';

loadApiEnv();
preferDirectDatabaseUrl();

const prisma = new PrismaClient();

function parseArgs(argv) {
  const options = {
    exportDir: 'migration-data',
    tables: '',
    json: false,
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--strict') {
      options.strict = true;
      continue;
    }

    if (arg === '--export-dir') {
      options.exportDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--tables') {
      options.tables = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.exportDir) {
    throw new Error('Missing value for --export-dir');
  }

  return options;
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readSourceCount(exportDir, fileName) {
  const filePath = path.join(exportDir, fileName);
  if (!(await fileExists(filePath))) {
    return { exists: false, count: 0 };
  }

  const content = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(content);
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.rows) ? payload.rows : null;
  if (!rows) {
    throw new Error(`Invalid export format in ${fileName}`);
  }

  return { exists: true, count: rows.length };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const exportDir = path.resolve(process.cwd(), options.exportDir);
  const selectedConfigs = parseTableSelection(options.tables);
  const results = [];

  for (const config of selectedConfigs) {
    const source = await readSourceCount(exportDir, config.fileName);
    const targetCount = await prisma[config.delegate].count();
    const matches = !source.exists || source.count === targetCount;

    results.push({
      table: config.label,
      fileName: config.fileName,
      sourceExists: source.exists,
      sourceCount: source.count,
      targetCount,
      matches,
    });
  }

  const mismatches = results.filter((result) => !result.matches);

  if (options.json) {
    console.log(JSON.stringify({ exportDir, results, mismatches }, null, 2));
  } else {
    for (const result of results) {
      console.log(`${result.table}: source=${result.sourceCount} target=${result.targetCount} matches=${result.matches}`);
    }
  }

  if (options.strict && mismatches.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
