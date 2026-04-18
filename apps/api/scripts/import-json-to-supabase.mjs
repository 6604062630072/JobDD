import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import {
  normalizeRow,
  parseCliArgs,
  parseTableSelection,
  tableConfigs,
} from './data-migration-config.mjs';
import { loadApiEnv, preferDirectDatabaseUrl } from './load-api-env.mjs';

loadApiEnv();
preferDirectDatabaseUrl();

const prisma = new PrismaClient();

function getRowsFromFilePayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.rows)) {
    return payload.rows;
  }

  throw new Error('Expected JSON export to be an array or an object with a rows array');
}

async function readExportRows(exportDir, fileName) {
  const filePath = path.join(exportDir, fileName);
  const content = await fs.readFile(filePath, 'utf8');
  return getRowsFromFilePayload(JSON.parse(content));
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectTablePlan(exportDir, config) {
  const filePath = path.join(exportDir, config.fileName);
  const exists = await fileExists(filePath);
  const currentCount = await prisma[config.delegate].count();

  if (!exists) {
    return {
      table: config.label,
      fileName: config.fileName,
      sourceCount: 0,
      targetCount: currentCount,
      missingFile: true,
      dependsOn: config.dependsOn,
    };
  }

  const rows = await readExportRows(exportDir, config.fileName);

  return {
    table: config.label,
    fileName: config.fileName,
    sourceCount: rows.length,
    targetCount: currentCount,
    missingFile: false,
    dependsOn: config.dependsOn,
  };
}

async function importTable(exportDir, config, batchSize, allowNonEmpty) {
  const filePath = path.join(exportDir, config.fileName);
  const exists = await fileExists(filePath);

  if (!exists) {
    return {
      table: config.label,
      skipped: true,
      reason: 'missing_file',
      importedCount: 0,
    };
  }

  const targetCount = await prisma[config.delegate].count();
  if (targetCount > 0 && !allowNonEmpty) {
    throw new Error(`Target table ${config.label} is not empty (${targetCount} rows). Re-run with --allow-non-empty if this is intentional.`);
  }

  const rawRows = await readExportRows(exportDir, config.fileName);
  const rows = rawRows.map((row) => normalizeRow(config, row));

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    if (batch.length === 0) {
      continue;
    }
    await prisma[config.delegate].createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  return {
    table: config.label,
    skipped: false,
    importedCount: rows.length,
  };
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2));
  const exportDir = path.resolve(process.cwd(), options.exportDir);
  const selectedConfigs = parseTableSelection(options.tables);
  const plan = [];

  for (const config of selectedConfigs) {
    plan.push(await collectTablePlan(exportDir, config));
  }

  if (!options.apply) {
    const output = {
      mode: 'dry-run',
      exportDir,
      tables: selectedConfigs.map((config) => config.label),
      plan,
    };

    if (options.json) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      for (const item of plan) {
        console.log(`${item.table}: source=${item.sourceCount} target=${item.targetCount} missingFile=${item.missingFile}`);
      }
    }
    return;
  }

  const selectedLabels = new Set(selectedConfigs.map((config) => config.label));
  const blocked = selectedConfigs.filter((config) =>
    config.dependsOn.some((dependency) => !selectedLabels.has(dependency)),
  );

  if (blocked.length > 0) {
    throw new Error(`Selected tables are missing dependencies: ${blocked.map((config) => `${config.label} -> ${config.dependsOn.join(',')}`).join('; ')}`);
  }

  const results = [];
  for (const config of tableConfigs) {
    if (!selectedLabels.has(config.label)) {
      continue;
    }
    results.push(await importTable(exportDir, config, options.batchSize, options.allowNonEmpty));
  }

  const output = {
    mode: 'apply',
    exportDir,
    results,
  };

  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    for (const result of results) {
      console.log(`${result.table}: imported=${result.importedCount} skipped=${result.skipped}`);
    }
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
